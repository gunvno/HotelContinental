package com.hotelcontinental.feedback_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackRequest {
    String roomBookingDetailId;
    String roomId;
    int rating;
    String comment;
    String customerName;
    Boolean anonymous;
}
