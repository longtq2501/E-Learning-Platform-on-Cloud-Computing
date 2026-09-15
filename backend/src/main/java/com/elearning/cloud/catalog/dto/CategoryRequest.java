package com.elearning.cloud.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Semester must not exceed 50 characters")
    private String semester;

    @Size(max = 100, message = "Major must not exceed 100 characters")
    private String major;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
