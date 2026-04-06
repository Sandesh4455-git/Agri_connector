package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.ChatRequest;
import com.agriconnect.backend.dto.ChatResponse;
import com.agriconnect.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        System.out.println("\n📩 ===== CHAT CONTROLLER =====");
        System.out.println("Received request for user type: " + request.getUserType());
        System.out.println("Message: " + request.getMessage());
        System.out.println("Language: " + request.getLanguage());

        try {
            ChatResponse response = chatService.processMessage(request);
            System.out.println("✅ Sending response back to client");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in ChatController: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ChatResponse("Server error: " + e.getMessage()));
        }
    }
}