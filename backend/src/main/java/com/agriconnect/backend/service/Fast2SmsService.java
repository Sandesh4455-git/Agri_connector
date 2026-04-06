package com.agriconnect.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class Fast2SmsService {

    private static final Logger logger = LoggerFactory.getLogger(Fast2SmsService.class);

    @Value("${fast2sms.api.key}")
    private String apiKey;

    @Value("${fast2sms.enabled:false}")
    private boolean enabled;

    public boolean sendOtp(String phone, String otp) {
        if (!enabled) {
            logger.warn("⚠️ Fast2SMS is disabled. OTP for {} : {}", phone, otp);
            return false;
        }

        try {
            // ✅ POST method + authorization HEADER (Node.js server.js प्रमाणे)
            URL url = new URL("https://www.fast2sms.com/dev/bulkV2");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("authorization", apiKey); // ✅ HEADER मध्ये key
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("cache-control", "no-cache");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setDoOutput(true);

            // ✅ JSON body
            String message = "Your AgriConnect OTP is " + otp + ". Valid for 5 minutes. Do not share with anyone.";
            String jsonBody = "{\"route\":\"q\",\"message\":\"" + message
                    + "\",\"language\":\"english\",\"flash\":0,\"numbers\":\"" + phone + "\"}";

            logger.info("📱 Fast2SMS sending to: {} | OTP: {}", phone, otp);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
            }

            int responseCode = conn.getResponseCode();
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                    responseCode == 200 ? conn.getInputStream() : conn.getErrorStream()));

            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null)
                response.append(line);
            reader.close();

            String responseBody = response.toString();
            logger.info("📱 Fast2SMS Response [{}]: {}", responseCode, responseBody);

            boolean success = responseCode == 200 && responseBody.contains("\"return\":true");

            if (success)
                logger.info("✅ OTP sent successfully to {}", phone);
            else
                logger.error("❌ Failed to send OTP to {}. Response: {}", phone, responseBody);

            return success;

        } catch (Exception e) {
            logger.error("❌ Fast2SMS exception for phone {}: {}", phone, e.getMessage(), e);
            return false;
        }
    }
}