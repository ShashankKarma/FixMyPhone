package com.fixmyphone.backend.modules.shop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairShopResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String email;
    private BigDecimal rating;
    private Integer totalReviews;
    private Boolean isApproved;
    private LocalDateTime createdAt;
}
