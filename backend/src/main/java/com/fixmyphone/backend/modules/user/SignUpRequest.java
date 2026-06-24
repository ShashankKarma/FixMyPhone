package com.fixmyphone.backend.modules.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignUpRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Please provide a valid phone number (10 to 15 digits)")
    private String phone;

    @NotBlank(message = "Role is required")
    private String role; // CUSTOMER, SHOP_OWNER, ADMIN
}
