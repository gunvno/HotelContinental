package com.hotelcontinental.catalog_service.service.interfaces;

import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateQuoteRequest;
import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateRuleRequest;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateQuoteResponse;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateRuleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoomRateRuleService {
    RoomRateRuleResponse createRule(RoomRateRuleRequest request);

    Page<RoomRateRuleResponse> getRules(Pageable pageable);

    RoomRateRuleResponse getRule(String id);

    RoomRateRuleResponse updateRule(String id, RoomRateRuleRequest request);

    void deleteRule(String id);

    RoomRateQuoteResponse quote(RoomRateQuoteRequest request);
}
