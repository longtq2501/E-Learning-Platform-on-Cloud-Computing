package com.elearning.cloud.catalog.dto;

import com.elearning.cloud.catalog.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private Long categoryId;
    private String categoryName;
    private String description;
    private String storageObjectKey;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;
    private Integer downloadCount;

    public static BookResponse fromEntity(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .description(book.getDescription())
                .storageObjectKey(book.getStorageObjectKey())
                .fileSize(book.getFileSize())
                .contentType(book.getContentType())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .viewCount(book.getViewCount())
                .downloadCount(book.getDownloadCount())
                .build();
    }
}
