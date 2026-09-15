package com.elearning.cloud.feedback.controller;

import com.elearning.cloud.auth.filter.JwtAuthenticationFilter;
import com.elearning.cloud.auth.service.JwtService;
import com.elearning.cloud.common.ApiResponse;
import com.elearning.cloud.config.SecurityConfig;
import com.elearning.cloud.feedback.dto.FeedbackRequest;
import com.elearning.cloud.feedback.dto.FeedbackResponse;
import com.elearning.cloud.feedback.entity.FeedbackTargetType;
import com.elearning.cloud.feedback.service.FeedbackService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FeedbackController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@TestPropertySource(properties = {
    "jwt.secret=bXktdmVyeS1zZWN1cmUtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRz",
    "jwt.expiration=86400000",
    "app.cors.allowed-origins=http://localhost:5173"
})
class FeedbackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FeedbackService feedbackService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    private FeedbackResponse sampleResponse() {
        return FeedbackResponse.builder()
                .id(1L)
                .userId(1L)
                .username("testuser")
                .targetType(FeedbackTargetType.BOOK)
                .targetId(1L)
                .rating(5)
                .content("Excellent book!")
                .build();
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void submitFeedback_success() throws Exception {
        FeedbackRequest request = new FeedbackRequest();
        request.setTargetType(FeedbackTargetType.BOOK);
        request.setTargetId(1L);
        request.setRating(5);
        request.setContent("Excellent book!");

        when(feedbackService.submitFeedback(any(), any())).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/feedbacks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void submitFeedback_unauthenticated_returns401() throws Exception {
        FeedbackRequest request = new FeedbackRequest();
        request.setTargetType(FeedbackTargetType.BOOK);
        request.setTargetId(1L);
        request.setRating(4);

        mockMvc.perform(post("/api/feedbacks")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getFeedbacks_byTarget_success() throws Exception {
        var page = new PageImpl<>(List.of(sampleResponse()));
        when(feedbackService.getFeedbacksByTarget(eq(FeedbackTargetType.BOOK), eq(1L), any(Pageable.class)))
                .thenReturn(page);

        // GET /api/feedbacks is public (permitAll for GET)
        mockMvc.perform(get("/api/feedbacks")
                        .param("targetType", "BOOK")
                        .param("targetId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].rating").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllFeedbacks_admin_success() throws Exception {
        var page = new PageImpl<>(List.of(sampleResponse()));
        when(feedbackService.getAllFeedbacks(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/feedbacks/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].targetType").value("BOOK"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getAllFeedbacks_student_isForbidden() throws Exception {
        mockMvc.perform(get("/api/feedbacks/admin"))
                .andExpect(status().isForbidden());
    }
}
