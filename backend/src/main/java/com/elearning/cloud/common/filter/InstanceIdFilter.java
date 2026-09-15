package com.elearning.cloud.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InstanceIdFilter extends OncePerRequestFilter {

    private final String instanceId;

    public InstanceIdFilter(@Value("${app.instance-id:${HOSTNAME:local}}") String instanceId) {
        this.instanceId = instanceId;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        response.setHeader("X-Instance-Id", instanceId);
        filterChain.doFilter(request, response);
    }
}