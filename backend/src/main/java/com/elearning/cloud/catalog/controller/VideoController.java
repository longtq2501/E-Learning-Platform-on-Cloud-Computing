package com.elearning.cloud.catalog.controller;

import com.elearning.cloud.catalog.dto.VideoRequest;
import com.elearning.cloud.catalog.dto.VideoResponse;
import com.elearning.cloud.catalog.service.VideoService;
import com.elearning.cloud.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Slf4j
public class VideoController {

    private final VideoService videoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoResponse>>> getAllVideos(
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(videoService.getAllVideos(categoryId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoResponse>> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(videoService.getVideoById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VideoResponse>> createVideo(
            @RequestBody @Valid VideoRequest request) {
        VideoResponse response = videoService.createVideo(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VideoResponse>> updateVideo(
            @PathVariable Long id,
            @RequestBody @Valid VideoRequest request) {
        VideoResponse response = videoService.updateVideo(id, request);
        return ResponseEntity.ok(ApiResponse.success("Video updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VideoResponse>> uploadVideoFile(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        VideoResponse response = videoService.uploadVideoFile(id, file);
        return ResponseEntity.ok(ApiResponse.success("Video uploaded successfully", response));
    }

    @GetMapping("/{id}/stream-url")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getStreamingUrl(@PathVariable Long id) {
        String streamingUrl = videoService.getVideoStreamingUrl(id);
        return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonMap("streamingUrl", streamingUrl)));
    }
}
