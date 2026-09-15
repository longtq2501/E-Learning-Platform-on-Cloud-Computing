package com.elearning.cloud.storage.service;

import com.elearning.cloud.storage.exception.StorageException;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Uploads a file to MinIO under the specified prefix.
     * Generates a unique object key to avoid collision.
     *
     * @param file the MultipartFile to upload
     * @param prefix folder-like prefix, e.g. "books" or "videos"
     * @return the unique storage object key
     */
    public String uploadFile(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Cannot upload empty file");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed"
        );
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String objectKey = String.format("%s/%s%s", prefix, UUID.randomUUID(), extension);
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            ensureBucketExists();
            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectKey)
                                .stream(is, file.getSize(), -1)
                                .contentType(contentType)
                                .build()
                );
            }
            log.info("Successfully uploaded file '{}' to MinIO as '{}' (size: {} bytes)",
                    originalFilename, objectKey, file.getSize());
            return objectKey;
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO: {}", e.getMessage(), e);
            throw new StorageException("Failed to upload file to object storage: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a presigned GET URL for temporary access to a private object.
     *
     * @param objectKey the object key in MinIO
     * @param expiryMinutes duration in minutes before the URL expires
     * @return the presigned URL
     */
    public String generatePresignedUrl(String objectKey, int expiryMinutes) {
        if (!StringUtils.hasText(objectKey)) {
            throw new StorageException("Object key cannot be empty");
        }

        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for key '{}': {}", objectKey, e.getMessage(), e);
            throw new StorageException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes an object from MinIO.
     *
     * @param objectKey the object key
     */
    public void deleteFile(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return;
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
            log.info("Successfully deleted object '{}' from MinIO", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object '{}' from MinIO: {}", objectKey, e.getMessage(), e);
            throw new StorageException("Failed to delete object from storage: " + e.getMessage(), e);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
        );
        if (!found) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
            );
            log.info("Created MinIO bucket: {}", bucketName);
        }
    }
}
