package com.elearning.cloud.catalog.repository;

import com.elearning.cloud.catalog.entity.Book;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query(value = "SELECT * FROM books WHERE to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')) @@ to_tsquery('simple', :query)", nativeQuery = true)
    List<Book> searchBooks(@Param("query") String query);
}
