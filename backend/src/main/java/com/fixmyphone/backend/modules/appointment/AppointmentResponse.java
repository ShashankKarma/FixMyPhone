package com.fixmyphone.backend.modules.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private Long shopId;
    private String shopName;
    private Long serviceId;
    private String serviceName;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String status;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
