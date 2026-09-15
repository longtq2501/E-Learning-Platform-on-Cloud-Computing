package com.elearning.cloud.feedback.dto;

import com.elearning.cloud.feedback.entity.Feedback;
import com.elearning.cloud.feedback.entity.FeedbackTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    private Long id;
    private Long userId;
    private String username;
    private FeedbackTargetType targetType;
    private Long targetId;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeedbackResponse fromEntity(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .userId(feedback.getUser() != null ? feedback.getUser().getId() : null)
                .username(feedback.getUser() != null ? feedback.getUser().getUsername() : null)
                .targetType(feedback.getTargetType())
                .targetId(feedback.getTargetId())
                .rating(feedback.getRating())
                .content(feedback.getContent())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
