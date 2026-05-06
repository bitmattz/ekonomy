package com.ekonomy.salary;

import com.ekonomy.salary.dto.SalaryDto;
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

@Path("/api/salaries")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SalaryResource {

    @Inject SalaryRepository salaryRepository;
    @Inject SecurityService securityService;

    @GET
    public List<SalaryDto> list() {
        User user = securityService.getCurrentUser();
        return salaryRepository.findByUserId(user.id).stream().map(this::toDto).toList();
    }

    @POST
    @Transactional
    public Response create(@Valid SalaryDto dto) {
        User user = securityService.getCurrentUser();
        Salary salary = new Salary();
        fromDto(salary, dto);
        salary.user = user;
        salaryRepository.persist(salary);
        return Response.status(201).entity(toDto(salary)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid SalaryDto dto) {
        User user = securityService.getCurrentUser();
        Salary salary = salaryRepository.findByIdOptional(id)
                .filter(s -> s.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));
        fromDto(salary, dto);
        return Response.ok(toDto(salary)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        User user = securityService.getCurrentUser();
        Salary salary = salaryRepository.findByIdOptional(id)
                .filter(s -> s.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));
        salaryRepository.delete(salary);
        return Response.noContent().build();
    }

    private void fromDto(Salary s, SalaryDto dto) {
        s.name = dto.name();
        s.amount = dto.amount() != null ? dto.amount() : BigDecimal.ZERO;
        s.investment_percentage = orZero(dto.investment_percentage());
        s.lifestyle_percentage  = orZero(dto.lifestyle_percentage());
        s.emergency_percentage  = orZero(dto.emergency_percentage());
        s.reward_percentage     = orZero(dto.reward_percentage());
    }

    private BigDecimal orZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private SalaryDto toDto(Salary s) {
        return new SalaryDto(s.id, s.name, s.amount,
                s.investment_percentage, s.lifestyle_percentage,
                s.emergency_percentage, s.reward_percentage);
    }
}
