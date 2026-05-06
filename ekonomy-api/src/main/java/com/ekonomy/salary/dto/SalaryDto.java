package com.ekonomy.salary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record SalaryDto(
    Long id,
    @NotBlank String name,
    @NotNull @Positive BigDecimal amount,
    BigDecimal investment_percentage,
    BigDecimal lifestyle_percentage,
    BigDecimal emergency_percentage,
    BigDecimal reward_percentage
){}