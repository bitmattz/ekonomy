package com.ekonomy.security;

import com.ekonomy.user.User;
import com.ekonomy.user.UserRepository;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@RequestScoped
public class SecurityService {

    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepository userRepository;

    public User getCurrentUser() {
        return userRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new WebApplicationException(Response.Status.UNAUTHORIZED));
    }
}
