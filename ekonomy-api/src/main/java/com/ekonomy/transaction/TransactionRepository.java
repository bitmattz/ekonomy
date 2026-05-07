package com.ekonomy.transaction;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TransactionRepository implements PanacheRepository<Transaction> {

    public List<Transaction> findByUserId(Long userId) {
        return list("user.id = ?1", Sort.by("date", Sort.Direction.Descending).and("createdAt", Sort.Direction.Descending), userId);
    }

    public List<Transaction> findByUserIdAndType(Long userId, String type) {
        if ("TRANSFER".equals(type)) {
            return list("user.id = ?1 and (type = 'TRANSFER_OUT' or type = 'TRANSFER_IN')",
                    Sort.by("date", Sort.Direction.Descending), userId);
        }
        return list("user.id = ?1 and type = ?2", Sort.by("date", Sort.Direction.Descending), userId, type);
    }

    public Optional<Transaction> findPartnerLeg(UUID transferId, Long excludeId) {
        return find("transferId = ?1 and id != ?2", transferId, excludeId).firstResultOptional();
    }
}
