package com.hotelcontinental.booking_service.service.serviceImpl;

import com.hotelcontinental.booking_service.dto.request.ResidenceRegistrationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingDateChangeRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.EditHistoryResponse;
import com.hotelcontinental.booking_service.dto.response.ResidenceRegistrationResponse;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.entity.EditHistory;
import com.hotelcontinental.booking_service.entity.ResidenceRegistration;
import com.hotelcontinental.booking_service.entity.RoomBookingDetails;
import com.hotelcontinental.booking_service.entity.RoomBookings;
import com.hotelcontinental.booking_service.enums.BookingType;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.enums.RoomBookingStatus;
import com.hotelcontinental.booking_service.event.BookingEventPublisher;
import com.hotelcontinental.booking_service.exception.AppException;
import com.hotelcontinental.booking_service.exception.ErrorCode;
import com.hotelcontinental.booking_service.repository.EditHistoryRepository;
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
import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RoomBookingServiceImpl implements RoomBookingService {
    private final RoomBookingsRepository roomBookingsRepository;
    private final RoomBookingDetailsRepository roomBookingDetailsRepository;
    private final ResidenceRegistrationRepository residenceRegistrationRepository;
    private final EditHistoryRepository editHistoryRepository;
    private final BookingEventPublisher bookingEventPublisher;

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

        boolean offlineBooking = request.getBookingType() == BookingType.OFFLINE;
        if (offlineBooking && !hasAuthority(authentication, "ROLE_RECEPTIONIST")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!offlineBooking) {
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
        float initialDiscountAmount = Math.max(0, request.getDiscountAmount());
        float initialTotalPrice = Math.max(
                0,
                request.getTotalRoomPrice() + initialServicePrice + request.getTotalExtraPrice() - initialDiscountAmount
        );
        RoomBookings booking = new RoomBookings();
        booking.setCustomerId(customerId);
        booking.setCustomerName(normalizeText(request.getCustomerName()));
        booking.setCustomerPhone(normalizeText(request.getCustomerPhone()));
        booking.setCustomerIdentityNumber(normalizeText(request.getCustomerIdentityNumber()));
        booking.setOfflineSource(offlineBooking ? normalizeOfflineSource(request.getOfflineSource()) : null);
        booking.setBookingType(request.getBookingType());
        booking.setStatus(offlineBooking ? RoomBookingStatus.DEPOSITED : RoomBookingStatus.PENDING);
        booking.setTotalRoomPrice(request.getTotalRoomPrice());
        booking.setTotalServicePrice(initialServicePrice);
        booking.setTotalExtraPrice(request.getTotalExtraPrice());
        booking.setTotalPrice(initialTotalPrice);
        if (request.getVoucherCode() != null) {
            booking.setVoucherCode(StringUtils.hasText(request.getVoucherCode()) ? request.getVoucherCode().trim() : null);
        }
        booking.setDiscountAmount(initialDiscountAmount);
        booking.setRefundStatus(StringUtils.hasText(request.getRefundStatus()) ? request.getRefundStatus().trim() : "NONE");
        booking.setRefundAmount(Math.max(0, request.getRefundAmount()));
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

        createPrimaryResidenceRegistrationIfPresent(request, detail);

        bookingEventPublisher.publish("BOOKING_CREATED", booking, detail, customerId);
        if (offlineBooking) {
            bookingEventPublisher.publish("BOOKING_DEPOSITED", booking, detail, customerId);
        }
        return map(booking, detail);
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<RoomBookingResponse> getRoomBookings() {
        if (!canAccessAdminPortal()) {
            return getMyRoomBookings();
        }

        return roomBookingsRepository.findActiveBookingRows().stream()
                .map(this::mapBookingRow)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<RoomBookingResponse> getMyRoomBookings() {
        String customerId = getCurrentActor();
        return roomBookingsRepository.findActiveBookingRowsByCustomerId(customerId).stream()
                .map(this::mapBookingRow)
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

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<EditHistoryResponse> getEditHistory(String id) {
        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);
        return editHistoryRepository
                .findByRoomBookingDetailsRoomBookingsIdOrderByModifiedAtDesc(id)
                .stream()
                .map(this::mapEditHistory)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<ResidenceRegistrationResponse> getResidenceRegistrations(String id) {
        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);
        RoomBookingDetails detail = getPrimaryDetail(id);
        if (detail == null) {
            return List.of();
        }

        return residenceRegistrationRepository
                .findByRoomBookingDetailsId(detail.getId())
                .stream()
                .map(this::mapResidenceRegistration)
                .toList();
    }

    @Transactional
    @Override
    public RoomBookingResponse markDeposited(String id) {
        RoomBookings booking = getBooking(id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : "system";

        RoomBookingStatus oldStatus = booking.getStatus();
        booking.setStatus(RoomBookingStatus.DEPOSITED);
        booking.setModifiedTime(LocalDateTime.now());
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        RoomBookingDetails detail = getPrimaryDetail(id);
        logBookingEdit(
                detail,
                "booking_status",
                oldStatus,
                RoomBookingStatus.DEPOSITED,
                "Booking marked as deposited",
                actor,
                booking.getModifiedTime()
        );
        bookingEventPublisher.publish("BOOKING_DEPOSITED", booking, detail, actor);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_RECEPTIONIST')")
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
    @PreAuthorize("hasAuthority('ROLE_RECEPTIONIST')")
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
        RoomBookingStatus oldBookingStatus = booking.getStatus();
        RoomBookingDetailStatus oldDetailStatus = detail.getStatus();
        LocalDateTime oldCheckinReality = detail.getCheckinReality();

        booking.setStatus(RoomBookingStatus.CHECKED_IN);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CHECKED_IN);
        detail.setCheckinReality(now);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking checked in", actor, now);
        logBookingEdit(detail, "detail_status", oldDetailStatus, detail.getStatus(), "Room booking detail checked in", actor, now);
        logBookingEdit(detail, "checkin_reality", oldCheckinReality, detail.getCheckinReality(), "Actual check-in time updated", actor, now);

        bookingEventPublisher.publish("BOOKING_CHECKED_IN", booking, detail, actor);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_RECEPTIONIST')")
    public RoomBookingResponse checkOut(String id) {
        RoomBookings booking = getBooking(id);
        RoomBookingDetails detail = getRequiredPrimaryDetail(id);

        if (booking.getStatus() != RoomBookingStatus.CHECKED_IN
                || detail.getStatus() != RoomBookingDetailStatus.CHECKED_IN) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();
        RoomBookingStatus oldBookingStatus = booking.getStatus();
        RoomBookingDetailStatus oldDetailStatus = detail.getStatus();
        LocalDateTime oldCheckoutReality = detail.getCheckoutReality();

        booking.setStatus(RoomBookingStatus.DONE);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CHECKED_OUT);
        detail.setCheckoutReality(now);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking checked out", actor, now);
        logBookingEdit(detail, "detail_status", oldDetailStatus, detail.getStatus(), "Room booking detail checked out", actor, now);
        logBookingEdit(detail, "checkout_reality", oldCheckoutReality, detail.getCheckoutReality(), "Actual check-out time updated", actor, now);

        bookingEventPublisher.publish("BOOKING_CHECKED_OUT", booking, detail, actor);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('BOOKING_UPDATE_TOTALS')")
    public RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request) {
        if (request == null || request.getTotalRoomPrice() <= 0 || request.getTotalPrice() < 0) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }

        RoomBookings booking = getBooking(id);
        validateBookingAccess(booking);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : "system";
        RoomBookingDetails detail = getPrimaryDetail(id);
        float oldTotalRoomPrice = booking.getTotalRoomPrice();
        float oldTotalServicePrice = booking.getTotalServicePrice();
        float oldTotalExtraPrice = booking.getTotalExtraPrice();
        float oldTotalPrice = booking.getTotalPrice();
        String oldVoucherCode = booking.getVoucherCode();
        float oldDiscountAmount = booking.getDiscountAmount();
        String oldRefundStatus = booking.getRefundStatus();
        float oldRefundAmount = booking.getRefundAmount();
        LocalDateTime now = LocalDateTime.now();

        booking.setTotalRoomPrice(request.getTotalRoomPrice());
        booking.setTotalServicePrice(request.getTotalServicePrice());
        booking.setTotalExtraPrice(request.getTotalExtraPrice());
        booking.setTotalPrice(request.getTotalPrice());
        if (request.getVoucherCode() != null) {
            booking.setVoucherCode(StringUtils.hasText(request.getVoucherCode()) ? request.getVoucherCode().trim() : null);
        }
        if (request.getDiscountAmount() != null) {
            booking.setDiscountAmount(Math.max(0, request.getDiscountAmount()));
        }
        if (request.getRefundStatus() != null) {
            booking.setRefundStatus(StringUtils.hasText(request.getRefundStatus()) ? request.getRefundStatus().trim() : "NONE");
        }
        if (request.getRefundAmount() != null) {
            booking.setRefundAmount(Math.max(0, request.getRefundAmount()));
        }
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        logBookingEdit(detail, "total_room_price", oldTotalRoomPrice, booking.getTotalRoomPrice(), "Room total price updated", actor, now);
        logBookingEdit(detail, "total_service_price", oldTotalServicePrice, booking.getTotalServicePrice(), "Service total price updated", actor, now);
        logBookingEdit(detail, "total_extra_price", oldTotalExtraPrice, booking.getTotalExtraPrice(), "Extra total price updated", actor, now);
        logBookingEdit(detail, "total_price", oldTotalPrice, booking.getTotalPrice(), "Booking total price updated", actor, now);
        logBookingEdit(detail, "voucher_code", oldVoucherCode, booking.getVoucherCode(), "Voucher code updated", actor, now);
        logBookingEdit(detail, "discount_amount", oldDiscountAmount, booking.getDiscountAmount(), "Discount amount updated", actor, now);
        logBookingEdit(detail, "refund_status", oldRefundStatus, booking.getRefundStatus(), "Refund status updated", actor, now);
        logBookingEdit(detail, "refund_amount", oldRefundAmount, booking.getRefundAmount(), "Refund amount updated", actor, now);
        bookingEventPublisher.publish("BOOKING_TOTALS_UPDATED", booking, detail, actor);
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
        LocalDateTime oldCheckin = detail.getCheckin();
        LocalDateTime oldCheckout = detail.getCheckout();

        detail.setCheckin(request.getCheckin());
        detail.setCheckout(request.getCheckout());
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        logBookingEdit(detail, "checkin", oldCheckin, detail.getCheckin(), "Booking check-in date changed", actor, now);
        logBookingEdit(detail, "checkout", oldCheckout, detail.getCheckout(), "Booking check-out date changed", actor, now);

        bookingEventPublisher.publish("BOOKING_DATES_CHANGED", booking, detail, actor);
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
        RoomBookingStatus oldBookingStatus = booking.getStatus();
        RoomBookingDetailStatus oldDetailStatus = detail.getStatus();

        if (booking.getStatus() == RoomBookingStatus.DEPOSITED) {
            booking.setStatus(RoomBookingStatus.CANCEL_REQUESTED);
            booking.setModifiedTime(now);
            booking.setModifiedBy(actor);
            booking = roomBookingsRepository.save(booking);
            logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking cancellation requested", actor, now);
            bookingEventPublisher.publish("BOOKING_CANCEL_REQUESTED", booking, detail, actor);
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

        logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking cancelled", actor, now);
        logBookingEdit(detail, "detail_status", oldDetailStatus, detail.getStatus(), "Room booking detail cancelled", actor, now);

        bookingEventPublisher.publish("BOOKING_CANCELLED", booking, detail, actor);
        return map(booking, detail);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
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
        RoomBookingStatus oldBookingStatus = booking.getStatus();
        RoomBookingDetailStatus oldDetailStatus = detail.getStatus();

        booking.setStatus(RoomBookingStatus.CANCEL);
        booking.setModifiedTime(now);
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        detail.setStatus(RoomBookingDetailStatus.CANCELED);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        detail = roomBookingDetailsRepository.save(detail);

        logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking cancellation approved", actor, now);
        logBookingEdit(detail, "detail_status", oldDetailStatus, detail.getStatus(), "Room booking detail cancelled after approval", actor, now);

        bookingEventPublisher.publish("BOOKING_CANCELLATION_APPROVED", booking, detail, actor);
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
            RoomBookingStatus oldBookingStatus = booking.getStatus();
            booking.setStatus(RoomBookingStatus.CANCEL);
            booking.setModifiedTime(now);
            booking.setModifiedBy("system-expired-payment");
            roomBookingsRepository.save(booking);

            roomBookingDetailsRepository.findByRoomBookingsId(booking.getId()).stream()
                    .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                    .filter(detail -> detail.getStatus() == RoomBookingDetailStatus.BOOKED)
                    .forEach(detail -> {
                        RoomBookingDetailStatus oldDetailStatus = detail.getStatus();
                        detail.setStatus(RoomBookingDetailStatus.CANCELED);
                        detail.setModifiedTime(now);
                        detail.setModifiedBy("system-expired-payment");
                        roomBookingDetailsRepository.save(detail);
                        logBookingEdit(detail, "booking_status", oldBookingStatus, booking.getStatus(), "Booking auto-cancelled because payment expired", "system-expired-payment", now);
                        logBookingEdit(detail, "detail_status", oldDetailStatus, detail.getStatus(), "Room booking detail auto-cancelled because payment expired", "system-expired-payment", now);
                        bookingEventPublisher.publish("BOOKING_AUTO_CANCELLED", booking, detail, "system-expired-payment");
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

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority::equals);
    }

    private String normalizeText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeOfflineSource(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return "WALK_IN";
        }
        return normalized.equalsIgnoreCase("PHONE") ? "PHONE" : "WALK_IN";
    }

    private void createPrimaryResidenceRegistrationIfPresent(
            RoomBookingCreationRequest request,
            RoomBookingDetails detail
    ) {
        if (!StringUtils.hasText(request.getCustomerName())
                || !StringUtils.hasText(request.getCustomerIdentityNumber())) {
            return;
        }

        ResidenceRegistration registration = new ResidenceRegistration();
        registration.setRoomBookingDetails(detail);
        registration.setFullName(request.getCustomerName().trim());
        registration.setIdentityNumber(request.getCustomerIdentityNumber().trim());
        registration.setGender(StringUtils.hasText(request.getCustomerGender()) ? request.getCustomerGender().trim() : "UNKNOWN");
        registration.setDateOfBirth(StringUtils.hasText(request.getCustomerDateOfBirth()) ? request.getCustomerDateOfBirth().trim() : "UNKNOWN");
        residenceRegistrationRepository.save(registration);
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
                + request.getTotalExtraPrice()
                - Math.max(0, request.getDiscountAmount());
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

    private void logBookingEdit(
            RoomBookingDetails detail,
            String fieldName,
            Object oldValue,
            Object newValue,
            String description,
            String actor,
            LocalDateTime modifiedAt
    ) {
        if (detail == null || Objects.equals(oldValue, newValue)) {
            return;
        }

        EditHistory history = new EditHistory();
        history.setRoomBookingDetails(detail);
        history.setFieldName(fieldName);
        history.setContent(formatEditContent(oldValue, newValue));
        history.setDescription(description);
        history.setModifiedAt(modifiedAt);
        history.setModifiedBy(actor);
        editHistoryRepository.save(history);
    }

    private String formatEditContent(Object oldValue, Object newValue) {
        return "%s -> %s".formatted(formatEditValue(oldValue), formatEditValue(newValue));
    }

    private String formatEditValue(Object value) {
        return value == null ? "null" : value.toString();
    }

    private EditHistoryResponse mapEditHistory(EditHistory history) {
        return EditHistoryResponse.builder()
                .id(history.getId())
                .roomBookingDetailId(
                        history.getRoomBookingDetails() != null
                                ? history.getRoomBookingDetails().getId()
                                : null
                )
                .fieldName(history.getFieldName())
                .content(history.getContent())
                .description(history.getDescription())
                .modifiedAt(history.getModifiedAt())
                .modifiedBy(history.getModifiedBy())
                .build();
    }

    private ResidenceRegistrationResponse mapResidenceRegistration(ResidenceRegistration registration) {
        return ResidenceRegistrationResponse.builder()
                .id(registration.getId())
                .roomBookingDetailId(
                        registration.getRoomBookingDetails() != null
                                ? registration.getRoomBookingDetails().getId()
                                : null
                )
                .fullName(registration.getFullName())
                .identityNumber(registration.getIdentityNumber())
                .gender(registration.getGender())
                .dateOfBirth(registration.getDateOfBirth())
                .build();
    }

    private RoomBookingResponse map(RoomBookings booking, RoomBookingDetails detail) {
        return RoomBookingResponse.builder()
                .id(booking.getId())
                .bookingDetailId(detail != null ? detail.getId() : null)
                .customerId(booking.getCustomerId())
                .customerName(booking.getCustomerName())
                .customerPhone(booking.getCustomerPhone())
                .customerIdentityNumber(booking.getCustomerIdentityNumber())
                .offlineSource(booking.getOfflineSource())
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
                .voucherCode(booking.getVoucherCode())
                .discountAmount(booking.getDiscountAmount())
                .refundStatus(booking.getRefundStatus())
                .refundAmount(booking.getRefundAmount())
                .build();
    }

    private RoomBookingResponse mapBookingRow(Object[] row) {
        return RoomBookingResponse.builder()
                .id(asString(row, 0))
                .customerId(asString(row, 1))
                .customerName(asString(row, 2))
                .customerPhone(asString(row, 3))
                .customerIdentityNumber(asString(row, 4))
                .offlineSource(asString(row, 5))
                .bookingType(parseEnum(BookingType.class, asString(row, 6)))
                .status(parseEnum(RoomBookingStatus.class, asString(row, 7)))
                .totalRoomPrice(asFloat(row, 8))
                .totalServicePrice(asFloat(row, 9))
                .totalExtraPrice(asFloat(row, 10))
                .totalPrice(asFloat(row, 11))
                .voucherCode(asString(row, 12))
                .discountAmount(asFloat(row, 13))
                .refundStatus(asString(row, 14))
                .refundAmount(asFloat(row, 15))
                .bookingDetailId(asString(row, 16))
                .roomId(asString(row, 17))
                .detailStatus(parseEnum(RoomBookingDetailStatus.class, asString(row, 18)))
                .checkin(asLocalDateTime(row, 19))
                .checkout(asLocalDateTime(row, 20))
                .checkinReality(asLocalDateTime(row, 21))
                .checkoutReality(asLocalDateTime(row, 22))
                .roomPrice(asFloat(row, 23))
                .deposit(asFloat(row, 24))
                .build();
    }

    private String asString(Object[] row, int index) {
        Object value = row.length > index ? row[index] : null;
        return value == null ? null : String.valueOf(value);
    }

    private float asFloat(Object[] row, int index) {
        Object value = row.length > index ? row[index] : null;
        if (value instanceof Number number) {
            return number.floatValue();
        }
        if (value instanceof String text && StringUtils.hasText(text)) {
            try {
                return Float.parseFloat(text);
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }

    private LocalDateTime asLocalDateTime(Object[] row, int index) {
        Object value = row.length > index ? row[index] : null;
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        return null;
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumType, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Enum.valueOf(enumType, value.trim());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
