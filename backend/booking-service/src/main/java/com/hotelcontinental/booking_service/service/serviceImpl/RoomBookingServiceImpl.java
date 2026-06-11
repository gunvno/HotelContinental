package com.hotelcontinental.booking_service.service.serviceImpl;

import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.entity.RoomBookingDetails;
import com.hotelcontinental.booking_service.entity.RoomBookings;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.enums.RoomBookingStatus;
import com.hotelcontinental.booking_service.exception.AppException;
import com.hotelcontinental.booking_service.exception.ErrorCode;
import com.hotelcontinental.booking_service.repository.RoomBookingDetailsRepository;
import com.hotelcontinental.booking_service.repository.RoomBookingsRepository;
import com.hotelcontinental.booking_service.service.interfaces.RoomBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomBookingServiceImpl implements RoomBookingService {
    private final RoomBookingsRepository roomBookingsRepository;
    private final RoomBookingDetailsRepository roomBookingDetailsRepository;

    private static final List<RoomBookingDetailStatus> BLOCKING_STATUSES = List.of(
            RoomBookingDetailStatus.BOOKED,
            RoomBookingDetailStatus.CHECKED_IN
    );

    @Transactional
    @Override
    public RoomBookingResponse createRoomBooking(RoomBookingCreationRequest request) {
        validateRequest(request);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String customerId = authentication.getName();

        boolean roomBusy = roomBookingDetailsRepository.findBusyRoomIds(
                request.getCheckin(),
                request.getCheckout(),
                BLOCKING_STATUSES
        ).contains(request.getRoomId());
        if (roomBusy) {
            throw new AppException(ErrorCode.ROOM_ALREADY_BOOKED);
        }

        LocalDateTime now = LocalDateTime.now();
        RoomBookings booking = new RoomBookings();
        booking.setCustomerId(customerId);
        booking.setBookingType(request.getBookingType());
        booking.setStatus(RoomBookingStatus.PENDING);
        booking.setTotalRoomPrice(request.getTotalRoomPrice());
        booking.setTotalServicePrice(request.getTotalServicePrice());
        booking.setTotalExtraPrice(request.getTotalExtraPrice());
        booking.setTotalPrice(request.getTotalPrice());
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
        detail.setDeposit(request.getDeposit());
        detail.setStatus(RoomBookingDetailStatus.BOOKED);
        detail.setCreatedTime(now);
        detail.setCreatedBy(customerId);
        detail.setDeleted(false);
        detail = roomBookingDetailsRepository.save(detail);

        return map(booking, detail);
    }

    @Override
    public RoomBookingResponse getRoomBooking(String id) {
        RoomBookings booking = roomBookingsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_BOOKING_REQUEST));
        List<RoomBookingDetails> details = roomBookingDetailsRepository.findByRoomBookingsId(id);
        RoomBookingDetails detail = !details.isEmpty()
                ? details.get(0)
                : null;
        return map(booking, detail);
    }

    @Transactional
    @Override
    public RoomBookingResponse markDeposited(String id) {
        RoomBookings booking = roomBookingsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_BOOKING_REQUEST));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : "system";

        booking.setStatus(RoomBookingStatus.DEPOSITED);
        booking.setModifiedTime(LocalDateTime.now());
        booking.setModifiedBy(actor);
        booking = roomBookingsRepository.save(booking);

        List<RoomBookingDetails> details = roomBookingDetailsRepository.findByRoomBookingsId(id);
        RoomBookingDetails detail = !details.isEmpty()
                ? details.get(0)
                : null;
        return map(booking, detail);
    }

    @Transactional
    @Override
    public RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request) {
        if (request == null || request.getTotalRoomPrice() <= 0 || request.getTotalPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }

        RoomBookings booking = roomBookingsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_BOOKING_REQUEST));

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

        List<RoomBookingDetails> details = roomBookingDetailsRepository.findByRoomBookingsId(id);
        RoomBookingDetails detail = !details.isEmpty()
                ? details.get(0)
                : null;
        return map(booking, detail);
    }

    private void validateRequest(RoomBookingCreationRequest request) {
        if (request == null || request.getRoomId() == null || request.getRoomId().isBlank()
                || request.getCheckin() == null || request.getCheckout() == null) {
            throw new AppException(ErrorCode.INVALID_BOOKING_REQUEST);
        }
        if (!request.getCheckin().isBefore(request.getCheckout())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }
        if (request.getTotalPrice() <= 0 || request.getTotalRoomPrice() <= 0 || request.getRoomPrice() <= 0) {
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
                .roomPrice(detail != null ? detail.getPrice() : 0)
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(booking.getTotalPrice())
                .deposit(detail != null ? detail.getDeposit() : 0)
                .build();
    }
}
