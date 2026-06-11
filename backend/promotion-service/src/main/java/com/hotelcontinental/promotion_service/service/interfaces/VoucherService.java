package com.hotelcontinental.promotion_service.service.interfaces;

import com.hotelcontinental.promotion_service.dto.request.VoucherApplyRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherConsumeRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherCreationRequest;
import com.hotelcontinental.promotion_service.dto.response.VoucherApplyResponse;
import com.hotelcontinental.promotion_service.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {
    VoucherResponse createVoucher(VoucherCreationRequest request);
    List<VoucherResponse> getVouchers();
    VoucherApplyResponse applyVoucher(VoucherApplyRequest request);
    VoucherResponse consumeVoucher(VoucherConsumeRequest request);
}
