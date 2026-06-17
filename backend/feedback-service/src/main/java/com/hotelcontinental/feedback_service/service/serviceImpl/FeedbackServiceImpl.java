package com.hotelcontinental.feedback_service.service.serviceImpl;

import com.hotelcontinental.feedback_service.dto.request.FeedbackRequest;
import com.hotelcontinental.feedback_service.dto.response.FeedbackResponse;
import com.hotelcontinental.feedback_service.entity.Feedbacks;
import com.hotelcontinental.feedback_service.exception.AppException;
import com.hotelcontinental.feedback_service.exception.ErrorCode;
import com.hotelcontinental.feedback_service.repository.FeedbackRepository;
import com.hotelcontinental.feedback_service.service.interfaces.FeedbackService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackServiceImpl implements FeedbackService {
    FeedbackRepository feedbackRepository;

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        String currentUser = getCurrentUser();
        validate(request);

        Feedbacks feedback = feedbackRepository
                .findByRoomBookingDetailIdAndCreatedByAndDeletedFalse(
                        request.getRoomBookingDetailId().trim(),
                        currentUser
                )
                .orElseGet(Feedbacks::new);

        LocalDateTime now = LocalDateTime.now();
        boolean isNewFeedback = feedback.getId() == null;

        feedback.setRoomBookingDetailId(request.getRoomBookingDetailId().trim());
        feedback.setRoomId(request.getRoomId().trim());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment().trim());
        feedback.setCustomerName(normalizeCustomerName(request.getCustomerName()));
        feedback.setAnonymous(Boolean.TRUE.equals(request.getAnonymous()));
        feedback.setDeleted(false);

        if (isNewFeedback) {
            feedback.setCreatedBy(currentUser);
            feedback.setCreatedTime(now);
        } else {
            feedback.setModifiedBy(currentUser);
            feedback.setModifiedTime(now);
        }

        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getMyFeedback(String roomBookingDetailId) {
        String currentUser = getCurrentUser();
        if (roomBookingDetailId == null || roomBookingDetailId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK);
        }

        return feedbackRepository
                .findByRoomBookingDetailIdAndCreatedByAndDeletedFalse(
                        roomBookingDetailId.trim(),
                        currentUser
                )
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getRoomFeedbacks(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK);
        }

        return feedbackRepository.findByRoomIdAndDeletedFalseOrderByCreatedTimeDesc(roomId.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validate(FeedbackRequest request) {
        if (request == null
                || request.getRoomBookingDetailId() == null
                || request.getRoomBookingDetailId().isBlank()
                || request.getRoomId() == null
                || request.getRoomId().isBlank()
                || request.getComment() == null
                || request.getComment().isBlank()
                || request.getRating() < 1
                || request.getRating() > 5) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK);
        }
    }

    private String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private FeedbackResponse toResponse(Feedbacks feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .roomBookingDetailId(feedback.getRoomBookingDetailId())
                .roomId(feedback.getRoomId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .customerName(feedback.getCustomerName())
                .anonymous(Boolean.TRUE.equals(feedback.getAnonymous()))
                .createdBy(feedback.getCreatedBy())
                .createdTime(feedback.getCreatedTime())
                .modifiedBy(feedback.getModifiedBy())
                .modifiedTime(feedback.getModifiedTime())
                .build();
    }

    private String normalizeCustomerName(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            return null;
        }
        return customerName.trim();
    }
}
