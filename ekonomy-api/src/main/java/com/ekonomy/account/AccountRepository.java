package com.ekonomy.account;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AccountRepository implements PanacheRepository<Account> {

    public List<Account> findByUserId(Long userId) {
        return list("user.id", userId);
    }
}
