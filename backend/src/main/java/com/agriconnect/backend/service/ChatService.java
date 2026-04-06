package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ChatRequest;
import com.agriconnect.backend.dto.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:}")
    private String apiUrl;

    private WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        System.out.println("🔧 Initializing ChatService...");
        System.out.println("📌 API URL: " + (apiUrl.isEmpty() ? "NOT FOUND" : apiUrl));
        System.out.println("🔑 API Key: "
                + (apiKey.isEmpty() ? "NOT FOUND" : apiKey.substring(0, Math.min(10, apiKey.length())) + "..."));

        String finalApiUrl = apiUrl.isEmpty() ? "https://api.groq.com/openai/v1/chat/completions" : apiUrl;
        String finalApiKey = apiKey.isEmpty() ? "YOUR_API_KEY" : apiKey;

        this.webClient = WebClient.builder()
                .baseUrl(finalApiUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", "Bearer " + finalApiKey)
                .build();

        System.out.println("✅ ChatService initialized successfully");
    }

    public ChatResponse processMessage(ChatRequest request) {
        System.out.println("\n🟢 ===== PROCESSING MESSAGE =====");
        System.out.println("User type: " + request.getUserType());
        System.out.println("Language: " + request.getLanguage());
        System.out.println("Message: " + request.getMessage());
        System.out.println("Session ID: " + request.getSessionId());

        try {
            String prompt = createPrompt(request);
            System.out.println("📝 Created prompt: " + prompt.substring(0, Math.min(100, prompt.length())) + "...");

            String response = callGroqAPI(prompt);
            System.out
                    .println("✅ Response received: " + response.substring(0, Math.min(100, response.length())) + "...");

            return new ChatResponse(response);
        } catch (Exception e) {
            System.err.println("❌ Error in processMessage: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse(getFallbackResponse(request.getLanguage()));
        }
    }

    private String createPrompt(ChatRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are AgriAssist, a helpful assistant for Agri Connect platform. ");
        prompt.append("Agri Connect connects farmers directly with customers, eliminating middlemen. ");
        prompt.append("Your responses should be friendly, practical, and concise. Keep responses to 2-3 sentences. ");

        if ("farmer".equals(request.getUserType())) {
            prompt.append(
                    "The user is a FARMER. Help them with listing produce, market prices, connecting with customers, crop management, and government schemes.\n");
        } else if ("dealer".equals(request.getUserType())) {
            prompt.append(
                    "The user is a DEALER. Help them with finding quality produce, bulk purchase options, and market trends.\n");
        } else if ("customer".equals(request.getUserType())) {
            prompt.append(
                    "The user is a CUSTOMER. Help them find fresh local produce, seasonal availability, and contact farmers.\n");
        } else {
            prompt.append("The user is a GUEST. Help them understand the platform.\n");
        }

        prompt.append("\nIMPORTANT: Respond in the SAME LANGUAGE as the user's message. ");

        String lang = request.getLanguage();
        if (lang == null)
            lang = "english";

        if ("marathi".equals(lang)) {
            prompt.append(
                    "The user is speaking Marathi. Respond in MARATHI language only. Use proper Marathi sentences.\n");
        } else if ("hindi".equals(lang)) {
            prompt.append("The user is speaking Hindi. Respond in HINDI language only.\n");
        } else {
            prompt.append("The user is speaking English. Respond in ENGLISH language only.\n");
        }

        prompt.append("\nUser message: ").append(request.getMessage());
        return prompt.toString();
    }

    private String callGroqAPI(String prompt) {
        try {
            System.out.println("\n🔵 ===== CALLING GROQ API =====");

            // Try different models in order of reliability
            String[] modelsToTry = {
                    "mixtral-8x7b-32768",
                    "llama3-70b-8192",
                    "gemma2-9b-it",
                    "llama-3.3-70b-versatile"
            };

            String lastError = null;

            for (String model : modelsToTry) {
                try {
                    System.out.println("📌 Trying model: " + model);

                    Map<String, Object> requestBody = Map.of(
                            "model", model,
                            "messages", List.of(Map.of("role", "user", "content", prompt)),
                            "temperature", 0.7,
                            "max_tokens", 500);

                    String responseJson = webClient.post()
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

                    JsonNode root = objectMapper.readTree(responseJson);

                    // Check if there's an error in the response
                    if (root.has("error")) {
                        String errorMsg = root.path("error").path("message").asText();
                        System.err.println("❌ Model " + model + " failed: " + errorMsg);
                        lastError = errorMsg;
                        continue; // Try next model
                    }

                    String content = root.path("choices").get(0).path("message").path("content").asText();
                    System.out.println("✅ Success with model: " + model);
                    System.out.println("📥 Response: " + content.substring(0, Math.min(100, content.length())) + "...");
                    return content;

                } catch (Exception e) {
                    System.err.println("❌ Model " + model + " exception: " + e.getMessage());
                    lastError = e.getMessage();
                    // Continue to next model
                }
            }

            // If all models fail
            System.err.println("❌ All models failed. Last error: " + lastError);
            return "I'm having trouble connecting right now. Please try again later.";

        } catch (Exception e) {
            System.err.println("\n❌ ===== GROQ API FATAL ERROR =====");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return getFallbackResponse("en");
        }
    }

    private String getFallbackResponse(String language) {
        if ("marathi".equals(language)) {
            return "क्षमस्व, सध्या सेवा उपलब्ध नाही. कृपया थोड्या वेळाने प्रयत्न करा.";
        } else if ("hindi".equals(language)) {
            return "क्षमा करें, सेवा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।";
        } else {
            return "Sorry, service is currently unavailable. Please try again later.";
        }
    }
}