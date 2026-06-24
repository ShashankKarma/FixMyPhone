package com.fixmyphone.backend.service;

import com.fixmyphone.backend.modules.appointment.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void sendAppointmentConfirmationToCustomer(Appointment appointment) {
        if (mailSender == null) {
            System.err.println("JavaMailSender is not initialized. Skipping email sending.");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(appointment.getCustomer().getEmail());
            message.setSubject("FixMyPhone - Appointment Booking Confirmed");
            message.setText(String.format(
                    "Hello %s,\n\n" +
                    "Your appointment at '%s' has been successfully booked.\n\n" +
                    "Details:\n" +
                    "- Service: %s\n" +
                    "- Date: %s\n" +
                    "- Time Slot: %s\n" +
                    "- Status: %s\n\n" +
                    "Thank you for choosing FixMyPhone!\n",
                    appointment.getCustomer().getName(),
                    appointment.getShop().getName(),
                    appointment.getService().getName(),
                    appointment.getAppointmentDate().format(DATE_FORMATTER),
                    appointment.getTimeSlot(),
                    appointment.getStatus()
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send customer confirmation email: " + e.getMessage());
        }
    }

    public void sendAppointmentNotificationToShopOwner(Appointment appointment) {
        if (mailSender == null) {
            System.err.println("JavaMailSender is not initialized. Skipping email sending.");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String recipientEmail = appointment.getShop().getEmail();
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                recipientEmail = appointment.getShop().getOwner().getEmail();
            }
            message.setTo(recipientEmail);
            message.setSubject("FixMyPhone - New Appointment Booked");
            message.setText(String.format(
                    "Hello %s,\n\n" +
                    "A customer has booked a new appointment at your shop '%s'.\n\n" +
                    "Details:\n" +
                    "- Customer Name: %s\n" +
                    "- Customer Phone: %s\n" +
                    "- Customer Email: %s\n" +
                    "- Selected Service: %s\n" +
                    "- Date: %s\n" +
                    "- Time Slot: %s\n" +
                    "- Notes: %s\n\n" +
                    "Please log in to your dashboard to review and manage this appointment.\n",
                    appointment.getShop().getOwner().getName(),
                    appointment.getShop().getName(),
                    appointment.getCustomer().getName(),
                    appointment.getCustomer().getPhone() != null ? appointment.getCustomer().getPhone() : "N/A",
                    appointment.getCustomer().getEmail(),
                    appointment.getService().getName(),
                    appointment.getAppointmentDate().format(DATE_FORMATTER),
                    appointment.getTimeSlot(),
                    appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty() ? appointment.getNotes() : "None"
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send shop owner notification email: " + e.getMessage());
        }
    }
}
