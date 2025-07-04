package org.example.backend.exception.employee;

import java.util.UUID;

public class EmployeeNotFoundException extends EmployeeException {
    public EmployeeNotFoundException(UUID employeeId) {
        super("Employee not found with id: " + employeeId);
    }
    
    public EmployeeNotFoundException(String email) {
        super("Employee not found with email: " + email);
    }
} 