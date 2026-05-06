package com.ekonomy.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record AccountDto(
        Long id,
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "CHECKING|SAVINGS|CREDIT_CARD|INVESTMENT|WALLET") String type,
        BigDecimal balance,
        @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
        String createdAt
) {}
