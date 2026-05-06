package com.ekonomy.salary;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class SalaryRepository implements PanacheRepository<Salary> {

    public List<Salary> findByUserId(Long userId) {
        return list("user.id = ?1", userId);
    }
}
