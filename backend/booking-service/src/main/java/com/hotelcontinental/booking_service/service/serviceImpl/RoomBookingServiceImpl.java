package com.hotelcontinental.booking_service.service.serviceImpl;

import com.hotelcontinental.booking_service.dto.request.ResidenceRegistrationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingDateChangeRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.entity.ResidenceRegistration;
import com.hotelcontinental.booking_service.entity.RoomBookingDetails;
import com.hotelcontinental.booking_service.entity.RoomBookings;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.enums.RoomBookingStatus;
import com.hotelcontinental.booking_service.exception.AppException;
import com.hotelcontinental.booking_service.exception.ErrorCode;
import com.hotelcontinental.booking_service.repository.ResidenceRegistrationRepository;
import com.hotelcontinental.booking_service.repository.RoomBookingDetailsRepository;
import com.hotelcontinental.booking_service.repository.RoomBookingsRepository;
import com.hotelcontinental.booking_service.service.interfaces.RoomBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomBookingServiceImpl implements RoomBookingService {
    private final RoomBookingsRepository roomBookingsRepository;
    private final RoomBookingDetailsRepository roomBookingDetailsRepository;
    private final ResidenceRegistrationRepository residenceRegistrationRepository;

    private static final List<RoomBookingDetailStatus> BLOCKING_STATUSES = List.of(
            RoomBookingDetailStatus.BOOKED,
            RoomBookingDetailStatus.CHECKED_IN
    );
    private static final int PENDING_PAYMENT_EXPIRATION_HOURS = 24;
    private static final int CHANGE_DATE_MIN_HOURS_BEFORE_CHECKIN = 48;
    private static final int FREE_CANCEL_MIN_HOURS_BEFORE_CHECKIN = 72;

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CREATE')")
    public synchronized RoomBookingResponse createRoomBooking(RoomBookingCreationRequest request) {
        validateRequest(request);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String customerId = authentication.getName();

        List<RoomBookingDetails> existingDetails = roomBookingDetailsRepository.findExistingActiveBookingDetails(
                customerId,
                request.getRoomId(),
                request.getCheckin(),
                request.getCheckout(),
                BLOCKING_STATUSES
        );
        if (!existingDetails.isEmpty()) {
            RoomBookingDetails existingDetail = existingDetails.get(0);
            return map(existingDetail.getRoomBookings(), existingDetail);
        }

        boolean roomBusy = roomBookingDetailsRepository.findBusyRoomIds(
                request.getCheckin(),
                request.getCheckout(),
                BLOCKING_STATUSES
        ).contains(request.getRoomId());
        if (roomBusy) {
            throw new AppException(ErrorCode.ROOM_ALREADY_BOOKED);
        }

        LocalDateTime now = LocalDateTime.now();
        float initialServicePrice = Math.max(0, request.getTotalServicePrice());
        float initialTotalPrice = request.getTotalRoomPrice() + initialServicePrice + request.getTotalExtraPrice();
        RoomBookings booking = new RoomBookings();
        booking.setCustomerId(customerId);
        booking.setBookingType(request.getBookingType());
        booking.setStatus(RoomBookingStatus.PENDING);
        booking.setTotalRoomPrice(request.getTotalRoomPrice());
        booking.setTotalServicePrice(initialServicePrice);
        booking.setTotalExtraPrice(request.getTotalExtraPrice());
        booking.setTotalPrice(initialTotalPrice);
        booking.setCreatedTime(now);
        booking.setCreatedBy(customerId);
        booking.setDeleted(false);
        booking = roomBookingsRepository.save(booking);

        RoomBookingDetails detail = new RoomBookingDetails();
        detail.setRoomBookings(booking);
        detail.setRoomId(request.getRoomId());
        detail.setPrice(request.getRoomPrice());
        detail.setTotalPrice(request.getTotalRoomPrice());
        detail.setCheckin(request.getCheckin());
        detail.setCheckout(request.getCheckout());
        detail.setDeposit(0);
        detail.setStatus(RoomBookingDetailStatus.BOOKED);
        detail.setCreatedTime(now);
        detail.setCreatedBy(customerId);
        detail.setDeleted(false);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<RoomBookingResponse> getRoomBookings() {
        if (!canAccessAdminPortal()) {
            return getMyRoomBookings();
        }

        return roomBookingsRepository.findAllByDeletedFalseOrderByCreatedTimeDesc().stream()
                .map(booking -> {
                    RoomBookingDetails detail = getPrimaryDetail(booking.getId());
                    return map(booking, detail);
                })
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<RoomBookingResponse> getMyRoomBookings() {
        String customerId = getCurrentActor();
        return roomBookingsRepository.findByCustomerIdAndDeletedFalseOrderByCreatedTimeDesc(customerId).stream()
                .map(booking -> {
                    RoomBookingDetails detail = getPrimaryDetail(booking.getId());
                    return map(booking, detail);
                })
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public RoomBookingResponse getRoomBooking(String id) {
        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);
        RoomBookingDetails detail = getPrimaryDetail(id);
        return map(booking, detail);
    }

    @Transactional
    @Override
    public RoomBookingResponse markDeposited(String id) {
        RoomBookings booking = getBooking(id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : "system";

        booking.setStatus(RoomBookingStatus.DEPOSITED);
        booking.setModifiedTime(LocalDateTime.now());
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        RoomBookingDetails detail = getPrimaryDetail(id);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CHECKIN')")
    public RoomBookingResponse registerResidence(String id, ResidenceRegistrationRequest request) {
        RoomBookings booking = getBooking(id);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if (booking.getStatus() != RoomBookingStatus.DEPOSITED
                || detail.getStatus() != RoomBookingDetailStatus.BOOKED) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }
        if (request == null || request.getGuests() == null || request.getGuests().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_RESIDENCE_REGISTRATION);
        }

        List<ResidenceRegistration> registrations = request.getGuests().stream()
                .map(guest -> {
                    if (guest == null
                            || !StringUtils.hasText(guest.getFullName())
                            || !StringUtils.hasText(guest.getIdentityNumber())
                            || !StringUtils.hasText(guest.getGender())
                            || !StringUtils.hasText(guest.getDateOfBirth())) {
                        throw new AppException(ErrorCode.INVALID_RESIDENCE_REGISTRATION);
                    }

                    ResidenceRegistration registration = new ResidenceRegistration();
                    registration.setRoomBookingDetails(detail);
                    registration.setFullName(guest.getFullName().trim());
                    registration.setIdentityNumber(guest.getIdentityNumber().trim());
                    registration.setGender(guest.getGender().trim());
                    registration.setDateOfBirth(guest.getDateOfBirth().trim());
                    return registration;
                })
                .toList();

        residenceRegistrationRepository.deleteByRoomBookingDetailsId(detail.getId());
        residenceRegistrationRepository.saveAll(registrations);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CHECKIN')")
    public RoomBookingResponse checkIn(String id) {
        RoomBookings booking = getBooking(id);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if (booking.getStatus() == RoomBookingStatus.CANCEL
                || booking.getStatus() == RoomBookingStatus.CANCEL_REQUESTED
                || booking.getStatus() == RoomBookingStatus.DONE
                || booking.getStatus() == RoomBookingStatus.CHECKED_IN
                || detail.getStatus() != RoomBookingDetailStatus.BOOKED) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        booking.setStatus(RoomBookingStatus.CHECKED_IN);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CHECKED_IN);
        detail.setCheckinReality(now);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CHECKOUT')")
    public RoomBookingResponse checkOut(String id) {
        RoomBookings booking = getBooking(id);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if (booking.getStatus() != RoomBookingStatus.CHECKED_IN
                || detail.getStatus() != RoomBookingDetailStatus.CHECKED_IN) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        booking.setStatus(RoomBookingStatus.DONE);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CHECKED_OUT);
        detail.setCheckoutReality(now);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_UPDATE_TOTALS')")
    public RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request) {
        if (request == null || request.getTotalRoomPrice() <= 0 || request.getTotalPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }

        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : "system";

        booking.setTotalRoomPrice(request.getTotalRoomPrice());
        booking.setTotalServicePrice(request.getTotalServicePrice());
        booking.setTotalExtraPrice(request.getTotalExtraPrice());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setModifiedTime(LocalDateTime.now());
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        RoomBookingDetails detail = getPrimaryDetail(id);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_UPDATE')")
    public RoomBookingResponse changeDates(String id, RoomBookingDateChangeRequest request) {
        validateDateChangeRequest(request);

        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if ((booking.getStatus() != RoomBookingStatus.PENDING && booking.getStatus() != RoomBookingStatus.DEPOSITED)
                || detail.getStatus() != RoomBookingDetailStatus.BOOKED) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }
        if (detail.getCheckin().isBefore(LocalDateTime.now().plusHours(CHANGE_DATE_MIN_HOURS_BEFORE_CHECKIN))) {
            throw new AppException(ErrorCode.BOOKING_CHANGE_PERIOD_EXPIRED);
        }

        boolean roomBusy = roomBookingDetailsRepository.existsOverlappingRoomBookingExcludingDetail(
                detail.getId(),
                detail.getRoomId(),
                request.getCheckin(),
                request.getCheckout(),
                BLOCKING_STATUSES
        );
        if (roomBusy) {
            throw new AppException(ErrorCode.ROOM_ALREADY_BOOKED);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        detail.setCheckin(request.getCheckin());
        detail.setCheckout(request.getCheckout());
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CANCEL')")
    public RoomBookingResponse cancelBooking(String id) {
        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if ((booking.getStatus() != RoomBookingStatus.PENDING && booking.getStatus() != RoomBookingStatus.DEPOSITED)
                || detail.getStatus() != RoomBookingDetailStatus.BOOKED) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }
        if (detail.getCheckin().isBefore(LocalDateTime.now().plusHours(FREE_CANCEL_MIN_HOURS_BEFORE_CHECKIN))) {
            throw new AppException(ErrorCode.BOOKING_CANCEL_PERIOD_EXPIRED);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        if (booking.getStatus() == RoomBookingStatus.DEPOSITED) {
            booking.setStatus(RoomBookingStatus.CANCEL_REQUESTED);
            booking.setModifiedTime(now);
            booking.setModifiedBy(actor);
            booking = roomBookingsRepository.save(booking);
            return map(booking, detail);
        }

        booking.setStatus(RoomBookingStatus.CANCEL);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CANCELED);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_CANCEL')")
    public RoomBookingResponse approveCancellation(String id) {
        if (!canAccessAdminPortal()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        RoomBookings booking = getBooking(id);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if (booking.getStatus() != RoomBookingStatus.CANCEL_REQUESTED
                || detail.getStatus() != RoomBookingDetailStatus.BOOKED) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        booking.setStatus(RoomBookingStatus.CANCEL);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CANCELED);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Scheduled(
            initialDelayString = "${app.booking-expiration-initial-delay-ms:60000}",
            fixedDelayString = "${app.booking-expiration-delay-ms:600000}"
    )
    @Transactional
    public void cancelExpiredPendingBookings() {
        LocalDateTime expiredBefore = LocalDateTime.now().minusHours(PENDING_PAYMENT_EXPIRATION_HOURS);
        List<RoomBookings> expiredBookings = roomBookingsRepository.findExpiredPendingBookings(
                RoomBookingStatus.PENDING,
                expiredBefore
        );

        LocalDateTime now = LocalDateTime.now();
        for (RoomBookings booking : expiredBookings) {
            booking.setStatus(RoomBookingStatus.CANCEL);
            booking.setModifiedTime(now);
            booking.setModifiedBy("system-expired-payment");
            roomBookingsRepository.save(booking);

            roomBookingDetailsRepository.findByRoomBookingsId(booking.getId()).stream()
                    .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                    .filter(detail -> detail.getStatus() == RoomBookingDetailStatus.BOOKED)
                    .forEach(detail -> {
                        detail.setStatus(RoomBookingDetailStatus.CANCELED);
                        detail.setModifiedTime(now);
                        detail.setModifiedBy("system-expired-payment");
                        roomBookingDetailsRepository.save(detail);
                    });
        }
    }

    private RoomBookings getBooking(String id) {
        return roomBookingsRepository.findById(id)
                .filter(booking -> !Boolean.TRUE.equals(booking.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private RoomBookingDetails getPrimaryDetail(String bookingId) {
        List<RoomBookingDetails> details = roomBookingDetailsRepository.findByRoomBookingsId(bookingId);
        return details.stream()
                .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                .findFirst()
                .orElse(null);
    }

    private RoomBookingDetails getRequiredPrimaryDetail(String bookingId) {
        RoomBookingDetails detail = getPrimaryDetail(bookingId);
        if (detail == null) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
        return detail;
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private boolean canAccessAdminPortal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ADMIN_PORTAL_ACCESS"::equals);
    }

    private void validateBookingAccess(RoomBookings booking) {
        if (canAccessAdminPortal()) {
            return;
        }

        if (!getCurrentActor().equals(booking.getCustomerId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateRequest(RoomBookingCreationRequest request) {
        if (request == null || request.getRoomId() == null || request.getRoomId().isBlank()
                || request.getCheckin() == null || request.getCheckout() == null) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
        if (!request.getCheckin().isBefore(request.getCheckout())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }
        float initialTotalPrice = request.getTotalRoomPrice()
                + Math.max(0, request.getTotalServicePrice())
                + request.getTotalExtraPrice();
        if (initialTotalPrice <= 0 || request.getTotalRoomPrice() <= 0 || request.getRoomPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
    }

    private void validateDateChangeRequest(RoomBookingDateChangeRequest request) {
        if (request == null || request.getCheckin() == null || request.getCheckout() == null) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
        if (!request.getCheckin().isBefore(request.getCheckout())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }
        if (!request.getCheckin().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
    }

    private RoomBookingResponse map(RoomBookings booking, RoomBookingDetails detail) {
        return RoomBookingResponse.builder()
                .id(booking.getId())
                .bookingDetailId(detail != null ? detail.getId() : null)
                .customerId(booking.getCustomerId())
                .roomId(detail != null ? detail.getRoomId() : null)
                .bookingType(booking.getBookingType())
                .status(booking.getStatus())
                .detailStatus(detail != null ? detail.getStatus() : null)
                .checkin(detail != null ? detail.getCheckin() : null)
                .checkout(detail != null ? detail.getCheckout() : null)
                .checkinReality(detail != null ? detail.getCheckinReality() : null)
                .checkoutReality(detail != null ? detail.getCheckoutReality() : null)
                .roomPrice(detail != null ? detail.getPrice() : 0)
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(booking.getTotalPrice())
                .deposit(detail != null ? detail.getDeposit() : 0)
                .build();
    }
}
