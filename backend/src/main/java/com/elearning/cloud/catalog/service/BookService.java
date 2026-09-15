package com.elearning.cloud.catalog.service;

import com.elearning.cloud.catalog.dto.BookRequest;
import com.elearning.cloud.catalog.dto.BookResponse;
import com.elearning.cloud.catalog.entity.Book;
import com.elearning.cloud.catalog.entity.Category;
import com.elearning.cloud.catalog.repository.BookRepository;
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
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final com.elearning.cloud.storage.service.StorageService storageService;

    public List<BookResponse> getAllBooks(Long categoryId) {
        List<Book> books;
        if (categoryId != null) {
            books = bookRepository.findByCategoryId(categoryId);
        } else {
            books = bookRepository.findAll();
        }
        return books.stream().map(BookResponse::fromEntity).toList();
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .category(category)
                .description(request.getDescription())
                .build();

        Book saved = bookRepository.save(book);
        log.info("Created book id: {} with title: {}", saved.getId(), saved.getTitle());
        return BookResponse.fromEntity(saved);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(category);
        book.setDescription(request.getDescription());

        Book updated = bookRepository.save(book);
        log.info("Updated book id: {}", updated.getId());
        return BookResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
        log.info("Deleted book id: {}", id);
    }

    @Transactional
    public BookResponse uploadBookFile(Long id, org.springframework.web.multipart.MultipartFile file) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        String objectKey = storageService.uploadFile(file, "books");
        book.setStorageObjectKey(objectKey);
        book.setFileSize(file.getSize());
        book.setContentType(file.getContentType() != null ? file.getContentType() : "application/pdf");

        Book saved = bookRepository.save(book);
        log.info("Uploaded file for book id: {}, objectKey: {}", id, objectKey);
        return BookResponse.fromEntity(saved);
    }
}
