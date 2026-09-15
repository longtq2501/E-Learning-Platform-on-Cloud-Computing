package com.elearning.cloud.catalog.service;

import com.elearning.cloud.catalog.dto.CategoryRequest;
import com.elearning.cloud.catalog.dto.CategoryResponse;
import com.elearning.cloud.catalog.entity.Category;
import com.elearning.cloud.catalog.repository.CategoryRepository;
import com.elearning.cloud.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .semester(request.getSemester())
                .major(request.getMajor())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created category id: {} with name: {}", saved.getId(), saved.getName());
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName());
        category.setSemester(request.getSemester());
        category.setMajor(request.getMajor());
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        log.info("Updated category id: {}", updated.getId());
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
        log.info("Deleted category id: {}", id);
    }
}
