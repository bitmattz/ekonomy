package com.ekonomy.category;

import com.ekonomy.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category extends PanacheEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String type;

    public String icon;

    public String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}
