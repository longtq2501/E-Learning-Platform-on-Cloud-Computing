package com.elearning.cloud.auth.exception;

/**
 * Thrown when a user tries to register with an email that already exists.
 * Maps to HTTP 409 CONFLICT in GlobalExceptionHandler.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
