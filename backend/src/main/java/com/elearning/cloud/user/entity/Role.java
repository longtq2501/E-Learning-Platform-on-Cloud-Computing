package com.elearning.cloud.user.entity;

/**
 * User roles in the system.
 * ADMIN: can manage all content (upload, CRUD categories/books/videos, view stats).
 * STUDENT: can browse, search, download/stream content, submit feedback.
 */
public enum Role {
    ADMIN,
    STUDENT
}
