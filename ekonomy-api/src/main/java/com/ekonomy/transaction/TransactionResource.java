package com.ekonomy.transaction;

import com.ekonomy.account.Account;
import com.ekonomy.account.AccountRepository;
import com.ekonomy.category.Category;
import com.ekonomy.category.CategoryRepository;
import com.ekonomy.security.SecurityService;
import com.ekonomy.transaction.dto.TransactionDto;
import com.ekonomy.transaction.dto.TransferDto;
import com.ekonomy.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Path("/api/transactions")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransactionResource {

    @Inject
    TransactionRepository transactionRepository;

    @Inject
    AccountRepository accountRepository;

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    SecurityService securityService;

    @GET
    public List<TransactionDto> list(@QueryParam("type") String type) {
        User user = securityService.getCurrentUser();
        List<Transaction> transactions = (type != null && !type.isBlank())
                ? transactionRepository.findByUserIdAndType(user.id, type)
                : transactionRepository.findByUserId(user.id);
        return transactions.stream().map(this::toDto).toList();
    }

    @POST
    @Transactional
    public Response create(@Valid TransactionDto dto) {
        if (dto.type().startsWith("TRANSFER")) {
            throw new WebApplicationException("Use POST /api/transfers to create transfers", Response.Status.BAD_REQUEST);
        }

        User user = securityService.getCurrentUser();

        Account account = accountRepository.findByIdOptional(dto.accountId())
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.BAD_REQUEST));

        Transaction tx = new Transaction();
        tx.description = dto.description();
        tx.amount = dto.amount();
        tx.type = dto.type();
        tx.date = LocalDate.parse(dto.date());
        tx.account = account;
        tx.user = user;
        tx.notes = dto.notes();

        if (dto.categoryId() != null) {
            tx.category = categoryRepository.findByIdOptional(dto.categoryId())
                    .filter(c -> c.user.id.equals(user.id))
                    .orElse(null);
        }

        updateAccountBalance(account, dto.type(), dto.amount());
        transactionRepository.persist(tx);
        return Response.status(201).entity(toDto(tx)).build();
    }

    @POST
    @Path("/transfer")
    @Transactional
    public Response createTransfer(@Valid TransferDto dto) {
        User user = securityService.getCurrentUser();

        Account from = accountRepository.findByIdOptional(dto.fromAccountId())
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.BAD_REQUEST));

        Account to = accountRepository.findByIdOptional(dto.toAccountId())
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.BAD_REQUEST));

        UUID transferId = UUID.randomUUID();
        LocalDate date = LocalDate.parse(dto.date());

        Transaction out = new Transaction();
        out.description = dto.description();
        out.amount = dto.amount();
        out.type = "TRANSFER_OUT";
        out.date = date;
        out.account = from;
        out.user = user;
        out.notes = dto.notes();
        out.transferId = transferId;

        Transaction in = new Transaction();
        in.description = dto.description();
        in.amount = dto.amount();
        in.type = "TRANSFER_IN";
        in.date = date;
        in.account = to;
        in.user = user;
        in.notes = dto.notes();
        in.transferId = transferId;

        from.balance = from.balance.subtract(dto.amount());
        to.balance = to.balance.add(dto.amount());

        transactionRepository.persist(out);
        transactionRepository.persist(in);

        return Response.status(201).entity(List.of(toDto(out), toDto(in))).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid TransactionDto dto) {
        User user = securityService.getCurrentUser();
        Transaction tx = transactionRepository.findByIdOptional(id)
                .filter(t -> t.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));

        if (tx.type.startsWith("TRANSFER") || dto.type().startsWith("TRANSFER")) {
            throw new WebApplicationException("Transfer transactions cannot be edited directly", Response.Status.BAD_REQUEST);
        }

        reverseAccountBalance(tx.account, tx.type, tx.amount);

        Account newAccount = accountRepository.findByIdOptional(dto.accountId())
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.BAD_REQUEST));

        tx.description = dto.description();
        tx.amount = dto.amount();
        tx.type = dto.type();
        tx.date = LocalDate.parse(dto.date());
        tx.account = newAccount;
        tx.notes = dto.notes();

        if (dto.categoryId() != null) {
            tx.category = categoryRepository.findByIdOptional(dto.categoryId())
                    .filter(c -> c.user.id.equals(user.id))
                    .orElse(null);
        } else {
            tx.category = null;
        }

        updateAccountBalance(newAccount, dto.type(), dto.amount());
        return Response.ok(toDto(tx)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        User user = securityService.getCurrentUser();
        Transaction tx = transactionRepository.findByIdOptional(id)
                .filter(t -> t.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));

        reverseAccountBalance(tx.account, tx.type, tx.amount);
        transactionRepository.delete(tx);

        if (tx.transferId != null) {
            transactionRepository.findPartnerLeg(tx.transferId, tx.id)
                    .ifPresent(partner -> {
                        reverseAccountBalance(partner.account, partner.type, partner.amount);
                        transactionRepository.delete(partner);
                    });
        }

        return Response.noContent().build();
    }

    private void updateAccountBalance(Account account, String type, BigDecimal amount) {
        if ("INCOME".equals(type) || "TRANSFER_IN".equals(type)) {
            account.balance = account.balance.add(amount);
        } else {
            account.balance = account.balance.subtract(amount);
        }
    }

    private void reverseAccountBalance(Account account, String type, BigDecimal amount) {
        if ("INCOME".equals(type) || "TRANSFER_IN".equals(type)) {
            account.balance = account.balance.subtract(amount);
        } else {
            account.balance = account.balance.add(amount);
        }
    }

    private TransactionDto toDto(Transaction t) {
        return new TransactionDto(
                t.id,
                t.description,
                t.amount,
                t.type,
                t.date != null ? t.date.toString() : null,
                t.account != null ? t.account.id : null,
                t.account != null ? t.account.name : null,
                t.category != null ? t.category.id : null,
                t.category != null ? t.category.name : null,
                t.notes,
                t.createdAt != null ? t.createdAt.toString() : null,
                t.transferId
        );
    }
}
