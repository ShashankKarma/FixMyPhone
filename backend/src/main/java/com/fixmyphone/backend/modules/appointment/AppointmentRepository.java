package com.fixmyphone.backend.modules.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerId(Long customerId);
    List<Appointment> findByShopId(Long shopId);
    List<Appointment> findByShopIdAndAppointmentDate(Long shopId, LocalDate date);
    List<Appointment> findByCustomerIdOrderByAppointmentDateDesc(Long customerId);
    List<Appointment> findByShopIdOrderByAppointmentDateDesc(Long shopId);
}
