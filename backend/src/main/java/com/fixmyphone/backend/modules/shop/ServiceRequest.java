package com.fixmyphone.backend.modules.shop;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceRequest {
    @NotBlank(message = "Service type/name is required")
    private String name; // e.g. SCREEN_REPLACEMENT, BATTERY_REPLACEMENT

    private String customName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be at least zero")
    private BigDecimal price;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    private Boolean isAvailable;
}
