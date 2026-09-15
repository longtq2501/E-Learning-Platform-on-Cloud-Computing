package com.elearning.cloud.feedback.controller;

import com.elearning.cloud.common.ApiResponse;
import com.elearning.cloud.feedback.dto.FeedbackRequest;
import com.elearning.cloud.feedback.dto.FeedbackResponse;
import com.elearning.cloud.feedback.entity.FeedbackTargetType;
import com.elearning.cloud.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @RequestBody @Valid FeedbackRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        FeedbackResponse response = feedbackService.submitFeedback(username, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedbackResponse>>> getFeedbacks(
            @RequestParam FeedbackTargetType targetType,
            @RequestParam Long targetId,
            Pageable pageable) {
        Page<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByTarget(targetType, targetId, pageable);
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }
}
