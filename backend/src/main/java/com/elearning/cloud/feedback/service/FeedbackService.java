package com.elearning.cloud.feedback.service;

import com.elearning.cloud.user.entity.User;
import com.elearning.cloud.user.repository.UserRepository;
import com.elearning.cloud.catalog.repository.BookRepository;
import com.elearning.cloud.catalog.repository.VideoRepository;
import com.elearning.cloud.common.ResourceNotFoundException;
import com.elearning.cloud.feedback.dto.FeedbackRequest;
import com.elearning.cloud.feedback.dto.FeedbackResponse;
import com.elearning.cloud.feedback.entity.Feedback;
import com.elearning.cloud.feedback.entity.FeedbackTargetType;
import com.elearning.cloud.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final VideoRepository videoRepository;

    @Transactional
    public FeedbackResponse submitFeedback(String username, FeedbackRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Validate target exists
        if (request.getTargetType() == FeedbackTargetType.BOOK) {
            if (!bookRepository.existsById(request.getTargetId())) {
                throw new ResourceNotFoundException("Book not found with id: " + request.getTargetId());
            }
        } else if (request.getTargetType() == FeedbackTargetType.VIDEO) {
            if (!videoRepository.existsById(request.getTargetId())) {
                throw new ResourceNotFoundException("Video not found with id: " + request.getTargetId());
            }
        }

        Feedback feedback = Feedback.builder()
                .user(user)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Feedback submitted by user {}, type: {}, targetId: {}", username, request.getTargetType(), request.getTargetId());
        return FeedbackResponse.fromEntity(saved);
    }

    public Page<FeedbackResponse> getFeedbacksByTarget(FeedbackTargetType targetType, Long targetId, Pageable pageable) {
        Page<Feedback> feedbacks = feedbackRepository.findByTargetTypeAndTargetId(targetType, targetId, pageable);
        return feedbacks.map(FeedbackResponse::fromEntity);
    }
}
