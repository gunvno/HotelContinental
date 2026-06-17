package com.hotelcontinental.feedback_service.service.interfaces;

import com.hotelcontinental.feedback_service.dto.request.FeedbackRequest;
import com.hotelcontinental.feedback_service.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse submitFeedback(FeedbackRequest request);

    FeedbackResponse getMyFeedback(String roomBookingDetailId);

    List<FeedbackResponse> getRoomFeedbacks(String roomId);
}
