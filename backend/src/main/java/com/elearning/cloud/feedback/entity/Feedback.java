package com.elearning.cloud.feedback.entity;

import com.elearning.cloud.user.entity.User;
import com.elearning.cloud.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedbacks", indexes = {
        @Index(name = "idx_feedbacks_target", columnList = "target_type, target_id"),
        @Index(name = "idx_feedbacks_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Feedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private FeedbackTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false)
    private Integer rating; // e.g. 1-5

    @Column(length = 2000)
    private String content;
}
