package com.ekonomy.export;

import com.ekonomy.account.Account;
import com.ekonomy.account.AccountRepository;
import com.ekonomy.account.dto.AccountDto;
import com.ekonomy.category.Category;
import com.ekonomy.category.CategoryRepository;
import com.ekonomy.category.dto.CategoryDto;
import com.ekonomy.salary.Salary;
import com.ekonomy.salary.SalaryRepository;
import com.ekonomy.salary.dto.SalaryDto;
import com.ekonomy.security.SecurityService;
import com.ekonomy.transaction.Transaction;
import com.ekonomy.transaction.TransactionRepository;
import com.ekonomy.transaction.dto.TransactionDto;
import com.ekonomy.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExportResource {

    @Inject SecurityService securityService;
    @Inject CategoryRepository categoryRepository;
    @Inject AccountRepository accountRepository;
    @Inject TransactionRepository transactionRepository;
    @Inject SalaryRepository salaryRepository;

    @GET
    @Path("/export")
    public Response export() {
        User user = securityService.getCurrentUser();

        List<CategoryDto> categories = categoryRepository.findByUserId(user.id).stream()
                .map(c -> new CategoryDto(c.id, c.name, c.type, c.icon, c.color))
                .toList();

        List<AccountDto> accounts = accountRepository.findByUserId(user.id).stream()
                .map(a -> new AccountDto(a.id, a.name, a.type, a.balance, a.currency,
                        a.createdAt != null ? a.createdAt.toString() : null))
                .toList();

        List<TransactionDto> transactions = transactionRepository.findByUserId(user.id).stream()
                .map(t -> new TransactionDto(
                        t.id, t.description, t.amount, t.type,
                        t.date != null ? t.date.toString() : null,
                        t.account != null ? t.account.id : null,
                        t.account != null ? t.account.name : null,
                        t.category != null ? t.category.id : null,
                        t.category != null ? t.category.name : null,
                        t.notes,
                        t.createdAt != null ? t.createdAt.toString() : null,
                        t.transferId))
                .toList();

        List<SalaryDto> salaries = salaryRepository.findByUserId(user.id).stream()
                .map(s -> new SalaryDto(s.id, s.name, s.amount,
                        s.investment_percentage, s.lifestyle_percentage,
                        s.emergency_percentage, s.reward_percentage))
                .toList();

        ExportBundle bundle = new ExportBundle(
                LocalDateTime.now().toString(), "1",
                categories, accounts, transactions, salaries);

        String filename = "ekonomy-backup-" + LocalDate.now() + ".json";
        return Response.ok(bundle)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .build();
    }

    @POST
    @Path("/import")
    @Transactional
    public Response importData(ExportBundle bundle) {
        User user = securityService.getCurrentUser();

        // Clear existing data (order respects FK constraints)
        transactionRepository.delete("user.id = ?1", user.id);
        salaryRepository.delete("user.id = ?1", user.id);
        accountRepository.delete("user.id = ?1", user.id);
        categoryRepository.delete("user.id = ?1", user.id);

        // Import categories
        Map<Long, Category> catMap = new HashMap<>();
        for (CategoryDto dto : bundle.categories()) {
            if (dto.id() == null) continue;
            Category c = new Category();
            c.name = dto.name();
            c.type = dto.type();
            c.icon = dto.icon();
            c.color = dto.color();
            c.user = user;
            categoryRepository.persist(c);
            catMap.put(dto.id(), c);
        }

        // Import accounts with their exported balances
        Map<Long, Account> accMap = new HashMap<>();
        for (AccountDto dto : bundle.accounts()) {
            if (dto.id() == null) continue;
            Account a = new Account();
            a.name = dto.name();
            a.type = dto.type();
            a.balance = dto.balance() != null ? dto.balance() : BigDecimal.ZERO;
            a.currency = dto.currency() != null ? dto.currency() : "BRL";
            a.user = user;
            accountRepository.persist(a);
            accMap.put(dto.id(), a);
        }

        // Import transaction records (skip balance update — accounts already carry correct balance)
        for (TransactionDto dto : bundle.transactions()) {
            Account acc = dto.accountId() != null ? accMap.get(dto.accountId()) : null;
            if (acc == null) continue;
            Transaction t = new Transaction();
            t.description = dto.description();
            t.amount = dto.amount();
            t.type = dto.type();
            t.date = dto.date() != null ? LocalDate.parse(dto.date()) : LocalDate.now();
            t.notes = dto.notes();
            t.transferId = dto.transferId();
            t.user = user;
            t.account = acc;
            t.category = dto.categoryId() != null ? catMap.get(dto.categoryId()) : null;
            transactionRepository.persist(t);
        }

        // Import salaries
        for (SalaryDto dto : bundle.salaries()) {
            Salary s = new Salary();
            s.name = dto.name();
            s.amount = dto.amount();
            s.investment_percentage = orZero(dto.investment_percentage());
            s.lifestyle_percentage  = orZero(dto.lifestyle_percentage());
            s.emergency_percentage  = orZero(dto.emergency_percentage());
            s.reward_percentage     = orZero(dto.reward_percentage());
            s.user = user;
            salaryRepository.persist(s);
        }

        return Response.ok().build();
    }

    private BigDecimal orZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
