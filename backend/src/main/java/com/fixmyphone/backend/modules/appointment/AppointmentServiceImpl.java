package com.fixmyphone.backend.modules.appointment;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.exception.UnauthorizedException;
import com.fixmyphone.backend.modules.shop.RepairShop;
import com.fixmyphone.backend.modules.shop.RepairShopRepository;
import com.fixmyphone.backend.modules.shop.ServiceRepository;
import com.fixmyphone.backend.modules.user.User;
import com.fixmyphone.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import java.math.BigDecimal;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private RepairShopRepository repairShopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public AppointmentResponse bookAppointment(AppointmentRequest request, User customer) {
        RepairShop shop = repairShopRepository.findById(request.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found"));
        
        com.fixmyphone.backend.modules.shop.Service service;
        if (request.getServiceId() != null && request.getServiceId() == -1) {
            service = serviceRepository.findByShopId(shop.getId()).stream()
                    .filter(s -> "Other / Custom Problem".equalsIgnoreCase(s.getName()))
                    .findFirst()
                    .orElseGet(() -> {
                        com.fixmyphone.backend.modules.shop.Service newService = com.fixmyphone.backend.modules.shop.Service.builder()
                                .shop(shop)
                                .name("Other / Custom Problem")
                                .customName("Please describe your problem in notes")
                                .price(BigDecimal.ZERO)
                                .durationMinutes(0)
                                .isAvailable(true)
                                .build();
                        return serviceRepository.save(newService);
                    });
        } else {
            service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        }

        if (!service.getShop().getId().equals(shop.getId())) {
            throw new IllegalArgumentException("Selected service does not belong to the selected shop!");
        }

        // Check if slot is already occupied
        List<Appointment> existingAppointments = appointmentRepository
                .findByShopIdAndAppointmentDate(shop.getId(), request.getAppointmentDate());
        
        boolean isOccupied = existingAppointments.stream()
                .anyMatch(app -> app.getTimeSlot().equalsIgnoreCase(request.getTimeSlot()) 
                        && app.getStatus() != AppointmentStatus.CANCELLED);
        
        if (isOccupied) {
            throw new IllegalArgumentException("The selected time slot is already booked!");
        }

        Appointment appointment = Appointment.builder()
                .customer(customer)
                .shop(shop)
                .service(service)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .status(AppointmentStatus.PENDING)
                .totalPrice(service.getPrice())
                .notes(request.getNotes())
                .build();

        Appointment savedApp = appointmentRepository.save(appointment);

        // Send Email Notifications
        try {
            emailService.sendAppointmentConfirmationToCustomer(savedApp);
            emailService.sendAppointmentNotificationToShopOwner(savedApp);
        } catch (Exception e) {
            System.err.println("Error sending appointment notification email: " + e.getMessage());
        }

        return mapToResponse(savedApp);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Auth check: Admin, Customer of appointment, or Shop Owner of the shop can view
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        boolean isCustomer = appointment.getCustomer().getId().equals(user.getId());
        boolean isShopOwner = appointment.getShop().getOwner().getId().equals(user.getId());

        if (!isAdmin && !isCustomer && !isShopOwner) {
            throw new UnauthorizedException("You are not authorized to view this appointment");
        }

        return mapToResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByShop(Long shopId, User owner) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found"));

        if (!shop.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to view appointments for this shop");
        }

        return appointmentRepository.findByShopIdOrderByAppointmentDateDesc(shopId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByShopAndDate(Long shopId, LocalDate date, User owner) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found"));

        if (!shop.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to view appointments for this shop");
        }

        return appointmentRepository.findByShopIdAndAppointmentDate(shopId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(Long id, AppointmentStatus status, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        boolean isCustomer = appointment.getCustomer().getId().equals(user.getId());
        boolean isShopOwner = appointment.getShop().getOwner().getId().equals(user.getId());

        if (status == AppointmentStatus.CANCELLED) {
            // Customer or Owner or Admin can cancel
            if (!isAdmin && !isCustomer && !isShopOwner) {
                throw new UnauthorizedException("Not authorized to cancel this appointment");
            }
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                throw new IllegalArgumentException("Cannot cancel a completed appointment");
            }
        } else {
            // Only Owner or Admin can make other status updates
            if (!isAdmin && !isShopOwner) {
                throw new UnauthorizedException("Only the shop owner or admin can update the appointment status");
            }
        }

        appointment.setStatus(status);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getOccupiedSlots(Long shopId, LocalDate date) {
        return appointmentRepository.findByShopIdAndAppointmentDate(shopId, date).stream()
                .filter(app -> app.getStatus() != AppointmentStatus.CANCELLED)
                .map(Appointment::getTimeSlot)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointmentsForAdmin() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment app) {
        return AppointmentResponse.builder()
                .id(app.getId())
                .customerId(app.getCustomer().getId())
                .customerName(app.getCustomer().getName())
                .customerPhone(app.getCustomer().getPhone())
                .customerEmail(app.getCustomer().getEmail())
                .shopId(app.getShop().getId())
                .shopName(app.getShop().getName())
                .serviceId(app.getService().getId())
                .serviceName(app.getService().getName())
                .appointmentDate(app.getAppointmentDate())
                .timeSlot(app.getTimeSlot())
                .status(app.getStatus().name())
                .totalPrice(app.getTotalPrice())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
