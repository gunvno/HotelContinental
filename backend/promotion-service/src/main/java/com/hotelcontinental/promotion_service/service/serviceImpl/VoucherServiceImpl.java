package com.hotelcontinental.promotion_service.service.serviceImpl;

import com.hotelcontinental.promotion_service.dto.request.VoucherApplyRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherConsumeRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherCreationRequest;
import com.hotelcontinental.promotion_service.dto.response.VoucherApplyResponse;
import com.hotelcontinental.promotion_service.dto.response.VoucherResponse;
import com.hotelcontinental.promotion_service.entity.VoucherDetails;
import com.hotelcontinental.promotion_service.entity.Vouchers;
import com.hotelcontinental.promotion_service.enums.DiscountType;
import com.hotelcontinental.promotion_service.enums.VoucherStatus;
import com.hotelcontinental.promotion_service.exception.AppException;
import com.hotelcontinental.promotion_service.exception.ErrorCode;
import com.hotelcontinental.promotion_service.repository.VoucherDetailsRepository;
import com.hotelcontinental.promotion_service.repository.VouchersRepository;
import com.hotelcontinental.promotion_service.service.interfaces.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    private final VouchersRepository vouchersRepository;
    private final VoucherDetailsRepository voucherDetailsRepository;

    @Transactional
    @Override
    public VoucherResponse createVoucher(VoucherCreationRequest request) {
        validateCreation(request);

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        String code = normalizeCode(request.getCode());

        voucherDetailsRepository.findAvailableByCode(code)
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.VOUCHER_CODE_EXISTED);
                });

        Vouchers voucher = new Vouchers();
        voucher.setName(request.getName().trim());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(normalizeDiscountType(request.getDiscountType()).name());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setStatus(VoucherStatus.VALID);
        voucher.setCreatedTime(now);
        voucher.setCreatedBy(actor);
        voucher.setDeleted(false);
        voucher = vouchersRepository.save(voucher);

        VoucherDetails detail = new VoucherDetails();
        detail.setVouchers(voucher);
        detail.setCode(code);
        detail.setStartDate(request.getStartDate());
        detail.setEndDate(request.getEndDate());
        detail.setCreatedTime(now);
        detail.setCreatedBy(actor);
        detail.setDeleted(false);
        detail = voucherDetailsRepository.save(detail);

        return map(voucher, detail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getVouchers() {
        return vouchersRepository.findAvailableOrderByCreatedTimeDesc()
                .stream()
                .flatMap(voucher -> Optional.ofNullable(voucher.getVoucherDetails())
                        .orElse(List.of())
                        .stream()
                        .map(detail -> map(voucher, detail)))
                .toList();
    }

    @Override
    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        if (request == null || request.getOrderAmount() <= 0 || request.getCode() == null || request.getCode().isBlank()) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_REQUEST);
        }

        VoucherDetails detail = getUsableVoucherDetail(request.getCode());
        Vouchers voucher = detail.getVouchers();
        DiscountType discountType = normalizeDiscountType(voucher.getDiscountType());
        float discountAmount = calculateDiscount(discountType, voucher.getDiscountValue(), request.getOrderAmount());
        float finalAmount = Math.max(0, request.getOrderAmount() - discountAmount);

        return VoucherApplyResponse.builder()
                .voucherId(voucher.getId())
                .voucherDetailId(detail.getId())
                .code(detail.getCode())
                .name(voucher.getName())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .orderAmount(request.getOrderAmount())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .build();
    }

    @Transactional
    @Override
    public VoucherResponse consumeVoucher(VoucherConsumeRequest request) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()
                || request.getRoomBookingId() == null || request.getRoomBookingId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_REQUEST);
        }

        VoucherDetails detail = getUsableVoucherDetail(request.getCode());
        detail.setRoomBookingId(request.getRoomBookingId().trim());
        detail.setModifiedTime(LocalDateTime.now());
        detail.setModifiedBy(getCurrentActor());
        detail = voucherDetailsRepository.save(detail);
        return map(detail.getVouchers(), detail);
    }

    private VoucherDetails getUsableVoucherDetail(String rawCode) {
        VoucherDetails detail = voucherDetailsRepository.findAvailableByCode(normalizeCode(rawCode))
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        Vouchers voucher = detail.getVouchers();
        LocalDateTime now = LocalDateTime.now();
        if (voucher == null || Boolean.TRUE.equals(voucher.getDeleted())
                || voucher.getStatus() != VoucherStatus.VALID
                || detail.getStartDate().isAfter(now)
                || detail.getEndDate().isBefore(now)) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        if (detail.getRoomBookingId() != null && !detail.getRoomBookingId().isBlank()) {
            throw new AppException(ErrorCode.VOUCHER_ALREADY_USED);
        }

        return detail;
    }

    private void validateCreation(VoucherCreationRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()
                || request.getCode() == null || request.getCode().isBlank()
                || request.getDiscountValue() <= 0
                || request.getStartDate() == null || request.getEndDate() == null
                || !request.getStartDate().isBefore(request.getEndDate())) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_REQUEST);
        }

        DiscountType discountType = normalizeDiscountType(request.getDiscountType());
        if (discountType == DiscountType.PERCENT && request.getDiscountValue() > 100) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_REQUEST);
        }
    }

    private float calculateDiscount(DiscountType discountType, float discountValue, float orderAmount) {
        float discountAmount = discountType == DiscountType.PERCENT
                ? orderAmount * discountValue / 100
                : discountValue;
        return Math.min(orderAmount, discountAmount);
    }

    private DiscountType normalizeDiscountType(String value) {
        if (value == null || value.isBlank()) {
            return DiscountType.FIXED;
        }
        try {
            return DiscountType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_REQUEST);
        }
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private VoucherResponse map(Vouchers voucher, VoucherDetails detail) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .detailId(detail.getId())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .status(voucher.getStatus())
                .code(detail.getCode())
                .startDate(detail.getStartDate())
                .endDate(detail.getEndDate())
                .roomBookingId(detail.getRoomBookingId())
                .build();
    }
}
