package com.hotelcontinental.ai_assistant_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiRoomSuggestionResponse {
    String roomId;
    String roomName;
    String image;
    Float pricePerDay;
    Float pricePerHour;
    String description;
    String reason;
}
