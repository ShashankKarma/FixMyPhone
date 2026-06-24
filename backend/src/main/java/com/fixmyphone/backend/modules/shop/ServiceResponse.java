package com.fixmyphone.backend.modules.shop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private Long shopId;
    private String name;
    private String customName;
    private BigDecimal price;
    private Integer durationMinutes;
    private Boolean isAvailable;
}
