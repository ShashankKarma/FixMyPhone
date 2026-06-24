package com.fixmyphone.backend.controller;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.modules.shop.*;
import com.fixmyphone.backend.modules.user.User;
import com.fixmyphone.backend.modules.user.UserRepository;
import com.fixmyphone.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class RepairShopController {

    @Autowired
    private RepairShopService repairShopService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<RepairShopResponse> createShop(
            @Valid @RequestBody RepairShopRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(repairShopService.createShop(request, user));
    }

    @PutMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<RepairShopResponse> updateShop(
            @Valid @RequestBody RepairShopRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(repairShopService.updateShop(request, user));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<RepairShopResponse> getMyShop(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(repairShopService.getShopByOwner(userPrincipal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairShopResponse> getShopById(@PathVariable Long id) {
        return ResponseEntity.ok(repairShopService.getShopById(id));
    }

    @GetMapping
    public ResponseEntity<List<RepairShopResponse>> getShops(
            @RequestParam(required = false) String city) {
        if (city != null && !city.trim().isEmpty()) {
            return ResponseEntity.ok(repairShopService.getApprovedShopsByCity(city.trim()));
        }
        return ResponseEntity.ok(repairShopService.getAllApprovedShops());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RepairShopResponse>> getAllShopsForAdmin() {
        return ResponseEntity.ok(repairShopService.getAllShopsForAdmin());
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RepairShopResponse> approveShop(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        return ResponseEntity.ok(repairShopService.approveShop(id, approve));
    }

    // SERVICES OFFERED ENDPOINTS

    @PostMapping("/my/services")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ServiceResponse> addService(
            @Valid @RequestBody ServiceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        RepairShopResponse shop = repairShopService.getShopByOwner(userPrincipal.getId());
        return ResponseEntity.ok(repairShopService.addService(shop.getId(), request, user));
    }

    @PutMapping("/my/services/{serviceId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long serviceId,
            @Valid @RequestBody ServiceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(repairShopService.updateService(serviceId, request, user));
    }

    @DeleteMapping("/my/services/{serviceId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<String> deleteService(
            @PathVariable Long serviceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        repairShopService.deleteService(serviceId, user);
        return ResponseEntity.ok("Service deleted successfully");
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getServices(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean onlyAvailable) {
        return ResponseEntity.ok(repairShopService.getServicesByShop(id, onlyAvailable));
    }
}
