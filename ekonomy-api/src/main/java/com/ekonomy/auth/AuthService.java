package com.ekonomy.auth;

import com.ekonomy.auth.dto.LoginRequest;
import com.ekonomy.auth.dto.LoginResponse;
import com.ekonomy.user.User;
import com.ekonomy.user.UserRepository;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new WebApplicationException(
                        Response.status(401).entity("Invalid credentials").build()));

        if (!BcryptUtil.matches(request.password(), user.password)) {
            throw new WebApplicationException(
                    Response.status(401).entity("Invalid credentials").build());
        }

        String token = Jwt.issuer("ekonomy")
                .subject(user.email)
                .groups(Set.of(user.role))
                .expiresIn(Duration.ofHours(24))
                .sign();

        return new LoginResponse(token, user.email, user.role);
    }
}
