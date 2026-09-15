package com.elearning.cloud.catalog.repository;

import com.elearning.cloud.catalog.entity.Book;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Override
    @EntityGraph(attributePaths = {"category"})
    List<Book> findAll();

    @Override
    @EntityGraph(attributePaths = {"category"})
    Optional<Book> findById(Long id);

    @EntityGraph(attributePaths = {"category"})
    List<Book> findByCategoryId(Long categoryId);
}
