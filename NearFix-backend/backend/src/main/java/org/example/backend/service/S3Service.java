package org.example.backend.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.Date;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;

@Service
@RequiredArgsConstructor
@Transactional
public class S3Service {

    private final AmazonS3 s3Client;

    @Value("${aws.s3.bucket.profile-photos}")
    private String profilePhotosBucket;

    @Value("${aws.s3.bucket.vehicle-photos}")
    private String vehiclePhotosBucket;

    @Value("${aws.s3.bucket.garage-photos}")
    private String garagePhotosBucket;

    @Value("${aws.s3.bucket.garage-documents}")
    private String garageDocumentsBucket;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.presigned-url.expiration}")
    private long presignedUrlExpiration;

    public String uploadProfilePhoto(MultipartFile file, String userEmail) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        String key = userEmail + fileExtension;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        PutObjectRequest putObjectRequest = new PutObjectRequest(
                profilePhotosBucket,
                key,
                file.getInputStream(),
                metadata
        );

        s3Client.putObject(putObjectRequest);

        return generatePresignedUrl(key, profilePhotosBucket);
    }

    public String updateProfilePhoto(MultipartFile file, String userEmail) throws IOException {
        // First delete the existing photo if it exists
        deleteProfilePhoto(userEmail);
        
        // Then upload the new photo
        return uploadProfilePhoto(file, userEmail);
    }

    public void deleteProfilePhoto(String userEmail) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = userEmail + extension;
            if (s3Client.doesObjectExist(profilePhotosBucket, key)) {
                s3Client.deleteObject(profilePhotosBucket, key);
                break; // Exit after deleting the first matching file
            }
        }
    }

    public String getProfilePhotoUrl(String userEmail) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = userEmail + extension;
            if (s3Client.doesObjectExist(profilePhotosBucket, key)) {
                return generatePresignedUrl(key, profilePhotosBucket);
            }
        }
        return null;
    }

    public String uploadVehiclePhoto(MultipartFile file, UUID vehicleId) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        String key = vehicleId.toString() + fileExtension;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        PutObjectRequest putObjectRequest = new PutObjectRequest(
                vehiclePhotosBucket,
                key,
                file.getInputStream(),
                metadata
        );

        s3Client.putObject(putObjectRequest);

        return generatePresignedUrl(key, vehiclePhotosBucket);
    }

    public String updateVehiclePhoto(MultipartFile file, UUID vehicleId) throws IOException {
        // First delete the existing photo if it exists
        deleteVehiclePhoto(vehicleId);
        
        // Then upload the new photo
        return uploadVehiclePhoto(file, vehicleId);
    }

    public void deleteVehiclePhoto(UUID vehicleId) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = vehicleId.toString() + extension;
            if (s3Client.doesObjectExist(vehiclePhotosBucket, key)) {
                s3Client.deleteObject(vehiclePhotosBucket, key);
                break; // Exit after deleting the first matching file
            }
        }
    }

    public String getVehiclePhotoUrl(UUID vehicleId) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = vehicleId.toString() + extension;
            if (s3Client.doesObjectExist(vehiclePhotosBucket, key)) {
                return generatePresignedUrl(key, vehiclePhotosBucket);
            }
        }
        return null;
    }

    public String uploadGaragePhoto(MultipartFile file, UUID garageId) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        String key = garageId.toString() + fileExtension;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        PutObjectRequest putObjectRequest = new PutObjectRequest(
                garagePhotosBucket,
                key,
                file.getInputStream(),
                metadata
        );

        s3Client.putObject(putObjectRequest);

        return generatePresignedUrl(key, garagePhotosBucket);
    }

    public String updateGaragePhoto(MultipartFile file, UUID garageId) throws IOException {
        // First delete the existing photo if it exists
        deleteGaragePhoto(garageId);
        
        // Then upload the new photo
        return uploadGaragePhoto(file, garageId);
    }

    public void deleteGaragePhoto(UUID garageId) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = garageId.toString() + extension;
            if (s3Client.doesObjectExist(garagePhotosBucket, key)) {
                s3Client.deleteObject(garagePhotosBucket, key);
                break; // Exit after deleting the first matching file
            }
        }
    }

    public String getGaragePhotoUrl(UUID garageId) {
        // Try common image extensions
        String[] extensions = {".jpg", ".jpeg", ".png", ".gif"};
        for (String extension : extensions) {
            String key = garageId.toString() + extension;
            if (s3Client.doesObjectExist(garagePhotosBucket, key)) {
                return generatePresignedUrl(key, garagePhotosBucket);
            }
        }
        return null;
    }

    public String uploadGarageDocument(MultipartFile file, UUID garageId) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Ensure the file is a PDF
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        String key = garageId + "/document.pdf";

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType("application/pdf");
        metadata.setContentLength(file.getSize());

        PutObjectRequest putObjectRequest = new PutObjectRequest(
                garageDocumentsBucket,
                key,
                file.getInputStream(),
                metadata
        );

        s3Client.putObject(putObjectRequest);

        return generatePresignedUrl(key, garageDocumentsBucket);
    }

    public void deleteGarageDocument(UUID garageId) {
        String key = garageId + "/document.pdf";
        if (s3Client.doesObjectExist(garageDocumentsBucket, key)) {
            s3Client.deleteObject(garageDocumentsBucket, key);
        }
    }

    public String getGarageDocumentUrl(UUID garageId) {
        String key = garageId + "/document.pdf";
        if (s3Client.doesObjectExist(garageDocumentsBucket, key)) {
            return generatePresignedUrl(key, garageDocumentsBucket);
        }
        return null;
    }

    public String updateGarageDocument(MultipartFile file, UUID garageId) throws IOException {
        deleteGarageDocument(garageId);
        return uploadGarageDocument(file, garageId);
    }
    private String generatePresignedUrl(String key, String bucket) {
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += presignedUrlExpiration;
        expiration.setTime(expTimeMillis);

        GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucket, key)
                .withMethod(com.amazonaws.HttpMethod.GET)
                .withExpiration(expiration);

        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }
    
    /**
     * Refreshes all pre-signed URLs for photos in all S3 buckets.
     * This method should be called periodically to ensure URLs don't expire.
     * 
     * @return A list of all the refreshed pre-signed URLs
     */
    public List<String> refreshAllPresignedUrls() {
        List<String> refreshedUrls = new ArrayList<>();
        
        // Refresh profile photos
        refreshedUrls.addAll(refreshBucketUrls(profilePhotosBucket));
        
        // Refresh vehicle photos
        refreshedUrls.addAll(refreshBucketUrls(vehiclePhotosBucket));
        
        // Refresh garage photos
        refreshedUrls.addAll(refreshBucketUrls(garagePhotosBucket));
        
        return refreshedUrls;
    }
    
    /**
     * Refreshes pre-signed URLs for all objects in the specified bucket.
     * 
     * @param bucketName The name of the bucket to refresh URLs for
     * @return A list of refreshed pre-signed URLs
     */
    private List<String> refreshBucketUrls(String bucketName) {
        List<String> refreshedUrls = new ArrayList<>();
        
        try {
            ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucketName);
            ListObjectsV2Result result;
            
            do {
                result = s3Client.listObjectsV2(req);
                
                for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
                    String key = objectSummary.getKey();
                    // Only process image files
                    if (key.matches(".*\\.(jpg|jpeg|png|gif)$")) {
                        String url = generatePresignedUrl(key, bucketName);
                        refreshedUrls.add(url);
                    }
                }
                
                // If there are more than 1000 objects, continue with the next batch
                String token = result.getNextContinuationToken();
                req.setContinuationToken(token);
                
            } while (result.isTruncated());
            
        } catch (Exception e) {
            // Log the error but don't fail the entire operation
            // In a production environment, you might want to use a proper logging framework
            System.err.println("Error refreshing URLs for bucket " + bucketName + ": " + e.getMessage());
        }
        
        return refreshedUrls;
    }
}