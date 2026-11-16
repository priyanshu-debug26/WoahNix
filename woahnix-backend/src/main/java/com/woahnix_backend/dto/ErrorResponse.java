package com.woahnix_backend.dto;

public record ErrorResponse(
        int status,
        String message
) {}