package com.ekonomy.export;

import com.ekonomy.account.dto.AccountDto;
import com.ekonomy.category.dto.CategoryDto;
import com.ekonomy.salary.dto.SalaryDto;
import com.ekonomy.transaction.dto.TransactionDto;

import java.util.List;

public record ExportBundle(
        String exportedAt,
        String version,
        List<CategoryDto> categories,
        List<AccountDto> accounts,
        List<TransactionDto> transactions,
        List<SalaryDto> salaries
) {}
