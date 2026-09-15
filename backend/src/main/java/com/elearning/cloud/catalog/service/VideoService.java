package com.elearning.cloud.catalog.service;

import com.elearning.cloud.catalog.dto.VideoRequest;
import com.elearning.cloud.catalog.dto.VideoResponse;
import com.elearning.cloud.catalog.entity.Category;
import com.elearning.cloud.catalog.entity.Video;
import com.elearning.cloud.catalog.repository.CategoryRepository;
import com.elearning.cloud.catalog.repository.VideoRepository;
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
public class VideoService {

    private final VideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final com.elearning.cloud.storage.service.StorageService storageService;

    public List<VideoResponse> getAllVideos(Long categoryId) {
        List<Video> videos;
        if (categoryId != null) {
            videos = videoRepository.findByCategoryId(categoryId);
        } else {
            videos = videoRepository.findAll();
        }
        return videos.stream().map(VideoResponse::fromEntity).toList();
    }

    public VideoResponse getVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));
        return VideoResponse.fromEntity(video);
    }

    @Transactional
    public VideoResponse createVideo(VideoRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Video video = Video.builder()
                .title(request.getTitle())
                .category(category)
                .description(request.getDescription())
                .durationSeconds(request.getDurationSeconds())
                .build();

        Video saved = videoRepository.save(video);
        log.info("Created video id: {} with title: {}", saved.getId(), saved.getTitle());
        return VideoResponse.fromEntity(saved);
    }

    @Transactional
    public VideoResponse updateVideo(Long id, VideoRequest request) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        video.setTitle(request.getTitle());
        video.setCategory(category);
        video.setDescription(request.getDescription());
        video.setDurationSeconds(request.getDurationSeconds());

        Video updated = videoRepository.save(video);
        log.info("Updated video id: {}", updated.getId());
        return VideoResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteVideo(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Video not found with id: " + id);
        }
        videoRepository.deleteById(id);
        log.info("Deleted video id: {}", id);
    }

    @Transactional
    public VideoResponse uploadVideoFile(Long id, org.springframework.web.multipart.MultipartFile file) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        String objectKey = storageService.uploadFile(file, "videos");
        video.setStorageObjectKey(objectKey);
        video.setFileSize(file.getSize());
        video.setContentType(file.getContentType() != null ? file.getContentType() : "video/mp4");

        Video saved = videoRepository.save(video);
        log.info("Uploaded media file for video id: {}, objectKey: {}", id, objectKey);
        return VideoResponse.fromEntity(saved);
    }

    public String getVideoStreamingUrl(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        if (!org.springframework.util.StringUtils.hasText(video.getStorageObjectKey())) {
            throw new ResourceNotFoundException("Video has no attached media file");
        }

        // 60 minutes expiry for video streaming
        return storageService.generatePresignedUrl(video.getStorageObjectKey(), 60);
    }
}
