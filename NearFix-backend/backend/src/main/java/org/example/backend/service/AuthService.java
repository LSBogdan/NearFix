package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.auth.AddressRequest;
import org.example.backend.dto.auth.AuthResponse;
import org.example.backend.dto.auth.LoginRequest;
import org.example.backend.dto.auth.RefreshTokenRequest;
import org.example.backend.dto.auth.RegisterRequest;
import org.example.backend.entity.Address;
import org.example.backend.entity.User;
import org.example.backend.exception.auth.EmailAlreadyExistsException;
import org.example.backend.exception.auth.InvalidCredentialsException;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.repository.AddressRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtTokenUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final S3Service s3Service;

    @Transactional
    public AuthResponse register(RegisterRequest request) throws IOException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException();
        }

        // Create address
        AddressRequest addressRequest = request.getAddress();
        Address address = new Address();
        address.setCountry(addressRequest.getCountry());
        address.setCity(addressRequest.getCity());
        address.setStreet(addressRequest.getStreet());
        address.setNumber(addressRequest.getNumber());
        address.setZipCode(addressRequest.getZipCode());
        address.setLatitude(addressRequest.getLatitude());
        address.setLongitude(addressRequest.getLongitude());
        address = addressRepository.save(address);

        // Upload profile photo if provided
        String profilePhotoUrl = null;
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            profilePhotoUrl = s3Service.uploadProfilePhoto(request.getProfilePhoto(), request.getEmail());
        }

        // Create user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setAddress(address);
        user.setProfilePhotoUrl(profilePhotoUrl);

        userRepository.save(user);

        String token = jwtTokenUtil.generateToken(user);
        String refreshToken = jwtTokenUtil.generateRefreshToken(user);
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new InvalidCredentialsException();
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtTokenUtil.generateToken(user);
        String refreshToken = jwtTokenUtil.generateRefreshToken(user);
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtTokenUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
        
        if (!jwtTokenUtil.validateRefreshToken(refreshToken, userDetails)) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        String newToken = jwtTokenUtil.generateToken(user);
        String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);
        
        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
    }

    @Transactional
    public String updateProfilePhoto(MultipartFile photo, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        String newProfilePhotoUrl = s3Service.updateProfilePhoto(photo, userEmail);
        user.setProfilePhotoUrl(newProfilePhotoUrl);
        userRepository.save(user);
        
        return newProfilePhotoUrl;
    }

    @Transactional
    public void deleteProfilePhoto(String userEmail) {
        // Find the user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));
        
        // Only proceed if the user has a profile photo
        if (user.getProfilePhotoUrl() != null) {
            // Delete the photo from S3
            s3Service.deleteProfilePhoto(userEmail);
            
            // Update the user's profile photo URL to null
            user.setProfilePhotoUrl(null);
            userRepository.save(user);
        }
    }

    public String refreshProfilePhotoUrl(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));
        
        if (user.getProfilePhotoUrl() == null) {
            return null;
        }

        try {
            return s3Service.getProfilePhotoUrl(userEmail);
        } catch (Exception e) {
            return null;
        }
    }
} 