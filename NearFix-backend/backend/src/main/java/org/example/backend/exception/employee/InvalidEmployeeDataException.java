package org.example.backend.exception.employee;
 
public class InvalidEmployeeDataException extends EmployeeException {
    public InvalidEmployeeDataException(String message) {
        super("Invalid employee data: " + message);
    }
} 