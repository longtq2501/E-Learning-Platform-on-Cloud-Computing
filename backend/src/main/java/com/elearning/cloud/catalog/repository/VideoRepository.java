package com.elearning.cloud.catalog.repository;

import com.elearning.cloud.catalog.entity.Video;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    @Override
    @EntityGraph(attributePaths = {"category"})
    List<Video> findAll();

    @Override
    @EntityGraph(attributePaths = {"category"})
    Optional<Video> findById(Long id);

    @EntityGraph(attributePaths = {"category"})
    List<Video> findByCategoryId(Long categoryId);

    @Query(value = "SELECT * FROM videos WHERE to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')) @@ to_tsquery('simple', :query)", nativeQuery = true)
    List<Video> searchVideos(@Param("query") String query);
}
