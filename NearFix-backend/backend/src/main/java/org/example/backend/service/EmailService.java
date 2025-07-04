package org.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Async
    public void sendGarageApprovalRequest(String garageName, String ownerName, String ownerEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New Garage Approval Request");
            helper.setText(String.format(
                "A new garage approval request has been submitted:\n\n" +
                "Garage Name: %s\n" +
                "Owner Name: %s\n" +
                "Owner Email: %s\n\n" +
                "Please review and take appropriate action.",
                garageName, ownerName, ownerEmail
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    @Async
    public void sendGarageStatusUpdate(String toEmail, String garageName, boolean isApproved, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Garage Status Update");
            helper.setText(String.format(
                "Your garage '%s' has been %s.\n\n" +
                (reason != null ? "Reason: %s\n\n" : "") +
                "Thank you for using our service.",
                garageName,
                isApproved ? "approved" : "rejected",
                reason
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendEmployeeAccountCreated(String toEmail, String employeeName, String tempPassword, String garageName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Employee Account Created - NearFix");
            helper.setText(String.format(
                "Hello %s,\n\n" +
                "Your employee account has been created for garage: %s\n\n" +
                "Your temporary password is: %s\n\n" +
                "Please log in and change your password immediately for security reasons.\n\n" +
                "Best regards,\nNearFix Team",
                employeeName, garageName, tempPassword
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendEmployeeAppointmentAssigned(String employeeEmail, java.time.LocalDate date, String garageName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(employeeEmail);
            helper.setSubject("New Appointment Assigned - NearFix");
            helper.setText(String.format(
                "Hello,\n\n" +
                "You have been assigned a new appointment at garage: %s\n" +
                "Date: %s\n\n" +
                "Please check your dashboard for more details.\n\n" +
                "Best regards,\nNearFix Team",
                garageName, date
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send appointment assignment email", e);
        }
    }

    @Async
    public void sendCustomerAppointmentStatusUpdate(String customerEmail, java.time.LocalDate date, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Appointment Status Update - NearFix");
            helper.setText(String.format(
                "Hello,\n\n" +
                "The status of your appointment on %s has changed to: %s\n\n" +
                "Please check your dashboard for more details.\n\n" +
                "Best regards,\nNearFix Team",
                date, newStatus
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send appointment status update email", e);
        }
    }

    @Async
    public void sendCustomerNoEmployeesAvailable(String customerEmail, java.time.LocalDate date, String garageName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("No Employees Available - NearFix");
            helper.setText(String.format(
                "Hello,\n\n" +
                "Unfortunately, there are no available employees at garage: %s for your appointment on %s.\n" +
                "Please reschedule your appointment at another service.\n\n" +
                "We apologize for the inconvenience.\n\n" +
                "Best regards,\nNearFix Team",
                garageName, date
            ));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send no employees available email", e);
        }
    }
}
