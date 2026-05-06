package com.ekonomy.category;

import com.ekonomy.category.dto.CategoryDto;
import com.ekonomy.security.SecurityService;
import com.ekonomy.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/categories")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    SecurityService securityService;

    @GET
    public List<CategoryDto> list() {
        User user = securityService.getCurrentUser();
        return categoryRepository.findByUserId(user.id)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @POST
    @Transactional
    public Response create(@Valid CategoryDto dto) {
        User user = securityService.getCurrentUser();
        Category category = new Category();
        category.name = dto.name();
        category.type = dto.type();
        category.icon = dto.icon();
        category.color = dto.color();
        category.user = user;
        categoryRepository.persist(category);
        return Response.status(201).entity(toDto(category)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid CategoryDto dto) {
        User user = securityService.getCurrentUser();
        Category category = categoryRepository.findByIdOptional(id)
                .filter(c -> c.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));

        category.name = dto.name();
        category.type = dto.type();
        category.icon = dto.icon();
        category.color = dto.color();
        return Response.ok(toDto(category)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        User user = securityService.getCurrentUser();
        Category category = categoryRepository.findByIdOptional(id)
                .filter(c -> c.user.id.equals(user.id))
                .orElseThrow(() -> new WebApplicationException(Response.Status.NOT_FOUND));
        categoryRepository.delete(category);
        return Response.noContent().build();
    }

    private CategoryDto toDto(Category c) {
        return new CategoryDto(c.id, c.name, c.type, c.icon, c.color);
    }
}
