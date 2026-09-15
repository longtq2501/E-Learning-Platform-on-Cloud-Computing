package com.elearning.cloud.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotNull(message = "CategoryId is required")
    private Long categoryId;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Min(value = 0, message = "Duration must be positive")
    private Integer durationSeconds;
}
