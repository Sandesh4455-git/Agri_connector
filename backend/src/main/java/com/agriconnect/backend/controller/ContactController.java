package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.ContactRequest;
import com.agriconnect.backend.model.ContactMessage;
import com.agriconnect.backend.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository contactRepository;

    @PostMapping
    public ResponseEntity<ApiResponse> submitContact(@RequestBody ContactRequest request) {
        // Log incoming request for debugging
        System.out.println("📩 Contact request received: " + request);
        try {
            // Basic validation
            if (request.getName() == null || request.getName().trim().isEmpty() ||
                    request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                    request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                System.out.println("❌ Validation failed – missing required fields");
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Name, email and message are required"));
            }

            ContactMessage contact = new ContactMessage();
            contact.setName(request.getName().trim());
            contact.setEmail(request.getEmail().trim());
            contact.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
            contact.setMessage(request.getMessage().trim());

            contactRepository.save(contact);
            System.out.println("✅ Contact saved with id: " + contact.getId());

            return ResponseEntity.ok(new ApiResponse(true, "Message sent successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ApiResponse(false, "Server error. Please try again."));
        }
    }
}