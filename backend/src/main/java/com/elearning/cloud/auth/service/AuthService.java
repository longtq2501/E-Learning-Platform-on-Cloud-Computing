package com.elearning.cloud.auth.service;

import com.elearning.cloud.auth.dto.request.LoginRequest;
import com.elearning.cloud.auth.dto.request.RegisterRequest;
import com.elearning.cloud.auth.dto.response.AuthResponse;
import com.elearning.cloud.auth.exception.EmailAlreadyExistsException;
import com.elearning.cloud.user.entity.Role;
import com.elearning.cloud.user.entity.User;
import com.elearning.cloud.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user and returns a JWT.
     * Role defaults to STUDENT if not provided.
     *
     * @throws EmailAlreadyExistsException if email is already registered (409)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        String accessToken = jwtService.generateToken(savedUser);
        return buildAuthResponse(savedUser, accessToken);
    }

    /**
     * Authenticates user credentials and returns a JWT.
     * authenticate() internally calls loadUserByUsername() — cast principal directly to avoid second DB lookup.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Cast principal directly — avoids a second DB lookup
        User user = (User) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(user);
        return buildAuthResponse(user, accessToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
