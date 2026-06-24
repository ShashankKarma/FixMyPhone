package com.fixmyphone.backend.modules.appointment;

import com.fixmyphone.backend.modules.user.User;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    AppointmentResponse bookAppointment(AppointmentRequest request, User customer);
    AppointmentResponse getAppointmentById(Long id, User user);
    List<AppointmentResponse> getAppointmentsByCustomer(Long customerId);
    List<AppointmentResponse> getAppointmentsByShop(Long shopId, User owner);
    List<AppointmentResponse> getAppointmentsByShopAndDate(Long shopId, LocalDate date, User owner);
    AppointmentResponse updateAppointmentStatus(Long id, AppointmentStatus status, User user);
    List<String> getOccupiedSlots(Long shopId, LocalDate date);
    List<AppointmentResponse> getAllAppointmentsForAdmin();
}
