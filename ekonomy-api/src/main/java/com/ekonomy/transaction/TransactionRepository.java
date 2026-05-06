package com.ekonomy.transaction;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TransactionRepository implements PanacheRepository<Transaction> {

    public List<Transaction> findByUserId(Long userId) {
        return list("user.id = ?1", Sort.by("date", Sort.Direction.Descending).and("createdAt", Sort.Direction.Descending), userId);
    }

    public List<Transaction> findByUserIdAndType(Long userId, String type) {
        return list("user.id = ?1 and type = ?2", Sort.by("date", Sort.Direction.Descending), userId, type);
    }
}
