package com.hotelcontinental.feedback_service.controller;

import com.hotelcontinental.feedback_service.dto.ApiResponse;
import com.hotelcontinental.feedback_service.dto.request.FeedbackRequest;
import com.hotelcontinental.feedback_service.dto.response.FeedbackResponse;
import com.hotelcontinental.feedback_service.service.interfaces.FeedbackService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackController {
    FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<FeedbackResponse> submitFeedback(@RequestBody FeedbackRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Feedback saved")
                .result(feedbackService.submitFeedback(request))
                .build();
    }

    @GetMapping("/me/{roomBookingDetailId}")
    public ApiResponse<FeedbackResponse> getMyFeedback(@PathVariable String roomBookingDetailId) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Success")
                .result(feedbackService.getMyFeedback(roomBookingDetailId))
                .build();
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<FeedbackResponse>> getRoomFeedbacks(@PathVariable String roomId) {
        return ApiResponse.<List<FeedbackResponse>>builder()
                .message("Success")
                .result(feedbackService.getRoomFeedbacks(roomId))
                .build();
    }
}
