package com.elearning.cloud.catalog.controller;

import com.elearning.cloud.auth.filter.JwtAuthenticationFilter;
import com.elearning.cloud.auth.service.JwtService;
import com.elearning.cloud.catalog.dto.VideoRequest;
import com.elearning.cloud.catalog.dto.VideoResponse;
import com.elearning.cloud.catalog.service.VideoService;
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

@WebMvcTest(VideoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@TestPropertySource(properties = {
    "jwt.secret=bXktdmVyeS1zZWN1cmUtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRz",
    "jwt.expiration=86400000",
    "app.cors.allowed-origins=http://localhost:5173"
})
class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VideoService videoService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getAllVideos_ShouldReturn200() throws Exception {
        VideoResponse v1 = VideoResponse.builder().id(1L).title("Introduction to Cloud").durationSeconds(3600).build();
        when(videoService.getAllVideos(null)).thenReturn(List.of(v1));

        mockMvc.perform(get("/api/videos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Introduction to Cloud"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getVideoById_WhenFound_ShouldReturn200() throws Exception {
        VideoResponse video = VideoResponse.builder().id(1L).title("Introduction to Cloud").durationSeconds(3600).build();
        when(videoService.getVideoById(1L)).thenReturn(video);

        mockMvc.perform(get("/api/videos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Introduction to Cloud"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getVideoById_WhenNotFound_ShouldReturn404() throws Exception {
        when(videoService.getVideoById(99L)).thenThrow(new ResourceNotFoundException("Video not found with id: 99"));

        mockMvc.perform(get("/api/videos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void createVideo_WhenStudent_ShouldReturn403() throws Exception {
        VideoRequest request = VideoRequest.builder()
                .title("Unauthorized Video")
                .categoryId(1L)
                .build();

        mockMvc.perform(post("/api/videos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verify(videoService, never()).createVideo(any());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void createVideo_WhenAdmin_ShouldReturn201() throws Exception {
        VideoRequest request = VideoRequest.builder()
                .title("Docker Deep Dive")
                .categoryId(1L)
                .durationSeconds(7200)
                .build();

        VideoResponse response = VideoResponse.builder()
                .id(5L)
                .title("Docker Deep Dive")
                .durationSeconds(7200)
                .categoryId(1L)
                .build();

        when(videoService.createVideo(any(VideoRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/videos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Docker Deep Dive"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void updateVideo_WhenAdmin_ShouldReturn200() throws Exception {
        VideoRequest request = VideoRequest.builder()
                .title("Docker Deep Dive v2")
                .categoryId(1L)
                .durationSeconds(7500)
                .build();

        VideoResponse response = VideoResponse.builder()
                .id(1L)
                .title("Docker Deep Dive v2")
                .durationSeconds(7500)
                .build();

        when(videoService.updateVideo(eq(1L), any(VideoRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/videos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Docker Deep Dive v2"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void deleteVideo_WhenAdmin_ShouldReturn204() throws Exception {
        doNothing().when(videoService).deleteVideo(1L);

        mockMvc.perform(delete("/api/videos/1"))
                .andExpect(status().isNoContent());

        verify(videoService).deleteVideo(1L);
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void uploadVideoFile_WhenAdmin_ShouldReturn200() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "lecture.mp4", "video/mp4", "dummy video stream".getBytes()
        );

        VideoResponse response = VideoResponse.builder()
                .id(1L)
                .title("Cloud Lecture")
                .storageObjectKey("videos/uuid.mp4")
                .build();

        when(videoService.uploadVideoFile(eq(1L), any())).thenReturn(response);

        mockMvc.perform(multipart("/api/videos/1/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.storageObjectKey").value("videos/uuid.mp4"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void uploadVideoFile_WhenStudent_ShouldReturn403() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "lecture.mp4", "video/mp4", "dummy video stream".getBytes()
        );

        mockMvc.perform(multipart("/api/videos/1/upload").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getStreamingUrl_WhenFileExists_ShouldReturn200WithUrl() throws Exception {
        when(videoService.getVideoStreamingUrl(1L))
                .thenReturn("http://localhost:9000/media/videos/test.mp4?sig=xyz");

        mockMvc.perform(get("/api/videos/1/stream-url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.streamingUrl").value("http://localhost:9000/media/videos/test.mp4?sig=xyz"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getStreamingUrl_WhenNoFileAttached_ShouldReturn404() throws Exception {
        when(videoService.getVideoStreamingUrl(1L))
                .thenThrow(new ResourceNotFoundException("Video has no attached media file"));

        mockMvc.perform(get("/api/videos/1/stream-url"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
