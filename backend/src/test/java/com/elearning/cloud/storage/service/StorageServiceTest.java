package com.elearning.cloud.storage.service;

import com.elearning.cloud.storage.exception.StorageException;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private StorageService storageService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(storageService, "bucketName", "test-bucket");
    }

    @Test
    void uploadFile_WithValidFile_ShouldReturnObjectKey() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture1.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        String objectKey = storageService.uploadFile(file, "books");

        assertThat(objectKey).isNotNull();
        assertThat(objectKey).startsWith("books/");
        assertThat(objectKey).endsWith(".pdf");

        verify(minioClient).putObject(any(PutObjectArgs.class));
    }

    @Test
    void uploadFile_WithEmptyFile_ShouldThrowStorageException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );

        assertThatThrownBy(() -> storageService.uploadFile(emptyFile, "books"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void generatePresignedUrl_WithValidKey_ShouldReturnUrl() throws Exception {
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn("http://localhost:9000/test-bucket/books/test.pdf?sign=123");

        String url = storageService.generatePresignedUrl("books/test.pdf", 15);

        assertThat(url).isEqualTo("http://localhost:9000/test-bucket/books/test.pdf?sign=123");
        verify(minioClient).getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class));
    }

    @Test
    void deleteFile_WithValidKey_ShouldCallRemoveObject() throws Exception {
        storageService.deleteFile("books/test.pdf");

        verify(minioClient).removeObject(any(RemoveObjectArgs.class));
    }
}
