package com.elearning.cloud.config;

import com.elearning.cloud.user.entity.Role;
import com.elearning.cloud.user.entity.User;
import com.elearning.cloud.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin-password:admin123}")
    private String seedAdminPassword;

    @Bean
    CommandLineRunner seedDefaultAdmins() {
        return args -> {
            createAdminIfMissing("admin@elearning.com", "Default Admin");
            createAdminIfMissing("teacher@elearning.com", "Teacher Admin");
        };
    }

    private void createAdminIfMissing(String email, String fullName) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(seedAdminPassword))
                    .fullName(fullName)
                    .role(Role.ADMIN)
                    .build());
        }
    }
}
