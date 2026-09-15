package com.elearning.cloud.catalog.entity;

import com.elearning.cloud.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books", indexes = {
        @Index(name = "idx_books_category_id", columnList = "category_id"),
        @Index(name = "idx_books_title", columnList = "title")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Book extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 150)
    private String author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 2000)
    private String description;

    @Column(name = "storage_object_key", length = 500)
    private String storageObjectKey;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;
}
