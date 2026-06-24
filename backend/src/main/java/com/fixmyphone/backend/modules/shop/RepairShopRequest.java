package com.fixmyphone.backend.modules.shop;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RepairShopRequest {
    @NotBlank(message = "Shop name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Zip code is required")
    private String zipCode;

    private Double latitude;
    private Double longitude;

    private String phone;

    @Email(message = "Please provide a valid email address")
    private String email;
}
