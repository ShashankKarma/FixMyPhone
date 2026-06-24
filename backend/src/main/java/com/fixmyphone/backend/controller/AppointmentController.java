package com.fixmyphone.backend.controller;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.modules.appointment.*;
import com.fixmyphone.backend.modules.user.User;
import com.fixmyphone.backend.modules.user.UserRepository;
import com.fixmyphone.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(appointmentService.bookAppointment(request, user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, user));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AppointmentResponse>> getCustomerAppointments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomer(userPrincipal.getId()));
    }

    @GetMapping("/shop/{shopId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<AppointmentResponse>> getShopAppointments(
            @PathVariable Long shopId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(appointmentService.getAppointmentsByShop(shopId, user));
    }

    @GetMapping("/shop/{shopId}/date")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<AppointmentResponse>> getShopAppointmentsByDate(
            @PathVariable Long shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(appointmentService.getAppointmentsByShopAndDate(shopId, date, user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, user));
    }

    @GetMapping("/shop/{shopId}/occupied-slots")
    public ResponseEntity<List<String>> getOccupiedSlots(
            @PathVariable Long shopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getOccupiedSlots(shopId, date));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointmentsForAdmin() {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsForAdmin());
    }
}
