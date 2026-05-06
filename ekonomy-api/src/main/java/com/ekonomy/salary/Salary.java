package com.ekonomy.salary;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.ekonomy.user.User;


@Entity
@Table(name = "salary")
public class Salary extends PanacheEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false, precision = 15, scale = 2)
    public BigDecimal amount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 4, scale = 2)
    public BigDecimal investment_percentage = BigDecimal.ZERO;

    @Column(nullable = false, precision = 4, scale = 2)
    public BigDecimal lifestyle_percentage = BigDecimal.ZERO;

    @Column(nullable = false, precision = 4, scale = 2)
    public BigDecimal emergency_percentage = BigDecimal.ZERO;

    @Column(nullable = false, precision = 4, scale = 2)
    public BigDecimal reward_percentage = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}
