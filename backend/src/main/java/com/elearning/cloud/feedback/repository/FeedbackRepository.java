package com.elearning.cloud.feedback.repository;

import com.elearning.cloud.feedback.entity.Feedback;
import com.elearning.cloud.feedback.entity.FeedbackTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @EntityGraph(attributePaths = {"user"})
    Page<Feedback> findByTargetTypeAndTargetId(FeedbackTargetType targetType, Long targetId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Optional<Feedback> findById(Long id);
}
