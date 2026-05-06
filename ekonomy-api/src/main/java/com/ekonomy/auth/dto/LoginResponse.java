package com.ekonomy.auth.dto;

public record LoginResponse(String token, String email, String role) {}
