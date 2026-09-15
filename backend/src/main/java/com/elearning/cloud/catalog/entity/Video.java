package com.elearning.cloud.catalog.entity;

import com.elearning.cloud.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "videos", indexes = {
        @Index(name = "idx_videos_category_id", columnList = "category_id"),
        @Index(name = "idx_videos_title", columnList = "title")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Video extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 2000)
    private String description;

    @Column(name = "storage_object_key", length = 500)
    private String storageObjectKey;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;
}
