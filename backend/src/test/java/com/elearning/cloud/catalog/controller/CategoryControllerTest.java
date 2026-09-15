package com.elearning.cloud.catalog.controller;

import com.elearning.cloud.auth.filter.JwtAuthenticationFilter;
import com.elearning.cloud.auth.service.JwtService;
import com.elearning.cloud.catalog.dto.CategoryRequest;
import com.elearning.cloud.catalog.dto.CategoryResponse;
import com.elearning.cloud.catalog.service.CategoryService;
import com.elearning.cloud.common.ResourceNotFoundException;
import com.elearning.cloud.config.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@TestPropertySource(properties = {
    "jwt.secret=bXktdmVyeS1zZWN1cmUtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRz",
    "jwt.expiration=86400000",
    "app.cors.allowed-origins=http://localhost:5173"
})
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getAllCategories_ShouldReturn200() throws Exception {
        CategoryResponse cat1 = CategoryResponse.builder().id(1L).name("Cloud Computing").build();
        CategoryResponse cat2 = CategoryResponse.builder().id(2L).name("Database Systems").build();

        when(categoryService.getAllCategories()).thenReturn(List.of(cat1, cat2));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("Cloud Computing"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getCategoryById_WhenFound_ShouldReturn200() throws Exception {
        CategoryResponse cat = CategoryResponse.builder().id(1L).name("Cloud Computing").build();
        when(categoryService.getCategoryById(1L)).thenReturn(cat);

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Cloud Computing"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getCategoryById_WhenNotFound_ShouldReturn404() throws Exception {
        when(categoryService.getCategoryById(99L))
                .thenThrow(new ResourceNotFoundException("Category not found with id: 99"));

        mockMvc.perform(get("/api/categories/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void createCategory_WhenStudent_ShouldReturn403() throws Exception {
        CategoryRequest request = CategoryRequest.builder().name("New Category").build();

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verify(categoryService, never()).createCategory(any());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void createCategory_WhenAdmin_ShouldReturn201() throws Exception {
        CategoryRequest request = CategoryRequest.builder().name("Distributed Systems").build();
        CategoryResponse response = CategoryResponse.builder().id(3L).name("Distributed Systems").build();

        when(categoryService.createCategory(any(CategoryRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Distributed Systems"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void updateCategory_WhenAdmin_ShouldReturn200() throws Exception {
        CategoryRequest request = CategoryRequest.builder().name("Updated Systems").build();
        CategoryResponse response = CategoryResponse.builder().id(1L).name("Updated Systems").build();

        when(categoryService.updateCategory(eq(1L), any(CategoryRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Systems"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void deleteCategory_WhenAdmin_ShouldReturn204() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategory(1L);
    }
}
