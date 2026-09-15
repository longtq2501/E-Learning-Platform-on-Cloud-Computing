package com.elearning.cloud.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Separate config class so @EnableJpaAuditing is NOT loaded during @WebMvcTest slices.
 * If placed on ElearningApplication, WebMvcTest would load it and fail with
 * "JPA metamodel must not be empty" since JPA is excluded from the web slice.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
