package com.elearning.cloud.catalog.dto;

import com.elearning.cloud.catalog.entity.Video;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {

    private Long id;
    private String title;
    private Long categoryId;
    private String categoryName;
    private String description;
    private String storageObjectKey;
    private Integer durationSeconds;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VideoResponse fromEntity(Video video) {
        return VideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .categoryId(video.getCategory() != null ? video.getCategory().getId() : null)
                .categoryName(video.getCategory() != null ? video.getCategory().getName() : null)
                .description(video.getDescription())
                .storageObjectKey(video.getStorageObjectKey())
                .durationSeconds(video.getDurationSeconds())
                .fileSize(video.getFileSize())
                .contentType(video.getContentType())
                .createdAt(video.getCreatedAt())
                .updatedAt(video.getUpdatedAt())
                .build();
    }
}
