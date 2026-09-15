package com.elearning.cloud.catalog.controller;

import com.elearning.cloud.auth.filter.JwtAuthenticationFilter;
import com.elearning.cloud.auth.service.JwtService;
import com.elearning.cloud.catalog.dto.BookRequest;
import com.elearning.cloud.catalog.dto.BookResponse;
import com.elearning.cloud.catalog.service.BookService;
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

@WebMvcTest(BookController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@TestPropertySource(properties = {
    "jwt.secret=bXktdmVyeS1zZWN1cmUtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRz",
    "jwt.expiration=86400000",
    "app.cors.allowed-origins=http://localhost:5173"
})
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookService bookService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getAllBooks_ShouldReturn200() throws Exception {
        BookResponse book1 = BookResponse.builder().id(1L).title("Designing Data-Intensive Applications").author("Martin Kleppmann").build();
        when(bookService.getAllBooks(null)).thenReturn(List.of(book1));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Designing Data-Intensive Applications"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getBookById_WhenFound_ShouldReturn200() throws Exception {
        BookResponse book = BookResponse.builder().id(1L).title("Cloud Native Java").author("Josh Long").build();
        when(bookService.getBookById(1L)).thenReturn(book);

        mockMvc.perform(get("/api/books/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Cloud Native Java"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getBookById_WhenNotFound_ShouldReturn404() throws Exception {
        when(bookService.getBookById(99L)).thenThrow(new ResourceNotFoundException("Book not found with id: 99"));

        mockMvc.perform(get("/api/books/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void createBook_WhenStudent_ShouldReturn403() throws Exception {
        BookRequest request = BookRequest.builder()
                .title("Unauthorized Book")
                .author("Author")
                .categoryId(1L)
                .build();

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verify(bookService, never()).createBook(any());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void createBook_WhenAdmin_ShouldReturn201() throws Exception {
        BookRequest request = BookRequest.builder()
                .title("Kubernetes in Action")
                .author("Marko Luksa")
                .categoryId(1L)
                .build();

        BookResponse response = BookResponse.builder()
                .id(10L)
                .title("Kubernetes in Action")
                .author("Marko Luksa")
                .categoryId(1L)
                .build();

        when(bookService.createBook(any(BookRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Kubernetes in Action"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void updateBook_WhenAdmin_ShouldReturn200() throws Exception {
        BookRequest request = BookRequest.builder()
                .title("Updated Title")
                .author("Updated Author")
                .categoryId(1L)
                .build();

        BookResponse response = BookResponse.builder()
                .id(1L)
                .title("Updated Title")
                .author("Updated Author")
                .build();

        when(bookService.updateBook(eq(1L), any(BookRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/books/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated Title"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void deleteBook_WhenAdmin_ShouldReturn204() throws Exception {
        doNothing().when(bookService).deleteBook(1L);

        mockMvc.perform(delete("/api/books/1"))
                .andExpect(status().isNoContent());

        verify(bookService).deleteBook(1L);
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void uploadBookFile_WhenAdmin_ShouldReturn200() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "test.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        BookResponse response = BookResponse.builder()
                .id(1L)
                .title("Sample Book")
                .storageObjectKey("books/uuid.pdf")
                .build();

        when(bookService.uploadBookFile(eq(1L), any())).thenReturn(response);

        mockMvc.perform(multipart("/api/books/1/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.storageObjectKey").value("books/uuid.pdf"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void uploadBookFile_WhenStudent_ShouldReturn403() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "test.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        mockMvc.perform(multipart("/api/books/1/upload").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getDownloadUrl_WhenFileExists_ShouldReturn200WithUrl() throws Exception {
        when(bookService.getBookDownloadUrl(1L))
                .thenReturn("http://localhost:9000/media/books/test.pdf?sig=abc");

        mockMvc.perform(get("/api/books/1/download-url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.downloadUrl").value("http://localhost:9000/media/books/test.pdf?sig=abc"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getDownloadUrl_WhenNoFileAttached_ShouldReturn404() throws Exception {
        when(bookService.getBookDownloadUrl(1L))
                .thenThrow(new ResourceNotFoundException("Book has no attached file"));

        mockMvc.perform(get("/api/books/1/download-url"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void searchBooks_ShouldReturn200WithResults() throws Exception {
        BookResponse book = BookResponse.builder().id(1L).title("Cloud Native Java").author("Josh Long").build();
        when(bookService.searchBooks("cloud")).thenReturn(List.of(book));

        mockMvc.perform(get("/api/books/search").param("q", "cloud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Cloud Native Java"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void incrementViewCount_ShouldReturn200() throws Exception {
        doNothing().when(bookService).incrementViewCount(1L);

        mockMvc.perform(post("/api/books/1/view").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void incrementDownloadCount_ShouldReturn200() throws Exception {
        doNothing().when(bookService).incrementDownloadCount(1L);

        mockMvc.perform(post("/api/books/1/download").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
