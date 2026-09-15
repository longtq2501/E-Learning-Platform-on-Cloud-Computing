package com.elearning.cloud.auth.service;

import com.elearning.cloud.auth.dto.request.LoginRequest;
import com.elearning.cloud.auth.dto.request.RegisterRequest;
import com.elearning.cloud.auth.dto.response.AuthResponse;
import com.elearning.cloud.auth.exception.EmailAlreadyExistsException;
import com.elearning.cloud.user.entity.Role;
import com.elearning.cloud.user.entity.User;
import com.elearning.cloud.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("student@test.com")
                .passwordHash("hashed_password")
                .fullName("Test Student")
                .role(Role.STUDENT)
                .build();
    }

    // ── register ────────────────────────────────────────────────────────────

    @Test
    void register_withValidRequest_shouldReturnAuthResponse() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@test.com")
                .password("password123")
                .fullName("New User")
                .build();

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        AuthResponse result = authService.register(request);

        assertThat(result.getAccessToken()).isEqualTo("jwt-token");
        assertThat(result.getTokenType()).isEqualTo("Bearer");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDefaultRole_shouldDefaultToStudent() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@test.com")
                .password("password123")
                .fullName("New User")
                .role(null) // no role specified
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertThat(u.getRole()).isEqualTo(Role.STUDENT);
            return sampleUser;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDuplicateEmail_shouldThrow409() {
        RegisterRequest request = RegisterRequest.builder()
                .email("existing@test.com")
                .password("password123")
                .fullName("User")
                .build();

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("existing@test.com");

        verify(userRepository, never()).save(any());
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_shouldReturnJwt() {
        LoginRequest request = LoginRequest.builder()
                .email("student@test.com")
                .password("password123")
                .build();

        var authToken = new UsernamePasswordAuthenticationToken(sampleUser, null, sampleUser.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(jwtService.generateToken(sampleUser)).thenReturn("jwt-token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        AuthResponse result = authService.login(request);

        assertThat(result.getAccessToken()).isEqualTo("jwt-token");
        assertThat(result.getUser().getRole()).isEqualTo("STUDENT");
    }

    @Test
    void login_withInvalidCredentials_shouldThrowBadCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("student@test.com")
                .password("wrong-password")
                .build();

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
