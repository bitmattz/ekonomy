package com.ekonomy.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransactionDto(
        Long id,
        @NotBlank String description,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Pattern(regexp = "INCOME|EXPENSE") String type,
        @NotBlank String date,
        @NotNull Long accountId,
        String accountName,
        Long categoryId,
        String categoryName,
        String notes,
        String createdAt
) {}
