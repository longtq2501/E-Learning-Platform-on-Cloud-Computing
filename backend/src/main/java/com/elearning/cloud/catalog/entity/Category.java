package com.elearning.cloud.catalog.entity;

import com.elearning.cloud.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_categories_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50)
    private String semester;

    @Column(length = 100)
    private String major;

    @Column(length = 500)
    private String description;
}
