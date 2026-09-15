package com.elearning.cloud.controller;

import com.elearning.cloud.auth.filter.JwtAuthenticationFilter;
import com.elearning.cloud.auth.service.JwtService;
import com.elearning.cloud.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(com.elearning.cloud.controller.HealthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@org.springframework.test.context.TestPropertySource(properties = {
    "jwt.secret=bXktdmVyeS1zZWN1cmUtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRz",
    "jwt.expiration=86400000",
    "app.cors.allowed-origins=http://localhost:5173"
})
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void healthCheckShouldReturnStatusUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
