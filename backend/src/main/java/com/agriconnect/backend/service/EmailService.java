package com.agriconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

  @Autowired(required = false)
  private JavaMailSender mailSender;

  @Value("${spring.mail.username:NOT_SET}")
  private String fromEmail;

  public void sendOtpEmail(String toEmail, String otp) throws Exception {
    // Dev mode: Mail config नसेल तर console मध्ये print करा
    if (mailSender == null || "NOT_SET".equals(fromEmail) || fromEmail.isBlank()) {
      System.out.println("========================================");
      System.out.println("📧 [DEV MODE] Email OTP for " + toEmail + ": " + otp);
      System.out.println("========================================");
      return;
    }

    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

    helper.setFrom(fromEmail);
    helper.setTo(toEmail);
    helper.setSubject("AgriConnect - Password Reset OTP");
    helper.setText(buildHtml(otp), true);

    mailSender.send(message);
    System.out.println("✅ OTP Email sent to: " + toEmail);
  }

  private String buildHtml(String otp) {
    return """
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;
                    padding:32px;background:#fdf8ed;border-radius:16px;">
          <div style="text-align:center;">
            <div style="font-size:48px;">🌾</div>
            <h2 style="color:#1a4a08;margin:8px 0;">AgriConnect</h2>
            <p style="color:#8a7a55;margin:0;">Password Reset OTP</p>
          </div>
          <div style="background:white;border-radius:14px;padding:28px;
                      text-align:center;border:2px solid #e8dfc0;margin-top:20px;">
            <p style="color:#3d3010;font-size:15px;margin-bottom:12px;">
              तुमचा One-Time Password:
            </p>
            <div style="font-size:44px;font-weight:800;color:#2d6a0a;
                        letter-spacing:14px;padding:18px;background:#f0fce8;
                        border-radius:12px;border:2px solid #86d63a;">
              %s
            </div>
            <p style="color:#8a7a55;font-size:13px;margin-top:16px;">
              ⏰ हा OTP फक्त <strong>10 minutes</strong> साठी valid आहे.
            </p>
            <p style="color:#ef4444;font-size:12px;">
              ⚠️ कुणाशीही share करू नका.
            </p>
          </div>
          <p style="text-align:center;color:#c4b898;font-size:11px;margin-top:20px;">
            © 2024 AgriConnect · शेतकऱ्याचा साथी
          </p>
        </div>
        """.formatted(otp);
  }
}