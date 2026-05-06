package com.ekonomy.account;

import com.ekonomy.account.dto.AccountDto;
import com.ekonomy.security.SecurityService;
import com.ekonomy.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.List;

@Path("/api/accounts")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AccountResource {

    @Inject
    AccountRepository accountRepository;

    @Inject
    SecurityService securityService;

    @GET
    public List<AccountDto> list() {
        User user = securityService.getCurrentUser();
        return accountRepository.findByUserId(user.id)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @POST
    @Transactional
    public Response create(@Valid AccountDto dto) {
        User user = securityService.getCurrentUser();
        Account account = new Account();
        account.name = dto.name();
        account.type = dto.type();
        account.balance = dto.balance() != null ? dto.balance() : BigDecimal.ZERO;
        account.currency = dto.currency() != null ? dto.currency() : "BRL";
        account.user = user;
        accountRepository.persist(account);
        return Response.status(201).entity(toDto(account)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid AccountDto dto) {
        User user = securityService.getCurrentUser();
        Account account = accountRepository.findByIdOptional(id)
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));

        account.name = dto.name();
        account.type = dto.type();
        account.currency = dto.currency();
        account.balance = dto.balance();

        return Response.ok(toDto(account)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        User user = securityService.getCurrentUser();
        Account account = accountRepository.findByIdOptional(id)
                .filter(a -> a.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));
        accountRepository.delete(account);
        return Response.noContent().build();
    }

    private AccountDto toDto(Account a) {
        return new AccountDto(a.id, a.name, a.type, a.balance, a.currency,
                a.createdAt != null ? a.createdAt.toString() : null);
    }
}
