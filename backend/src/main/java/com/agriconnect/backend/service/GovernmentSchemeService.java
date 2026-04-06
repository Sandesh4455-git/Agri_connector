package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.GovernmentScheme;
import com.agriconnect.backend.repository.GovernmentSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GovernmentSchemeService {

    private final GovernmentSchemeRepository schemeRepository;
    private boolean initialized = false;

    public void initDefaultSchemes() {
        if (initialized)
            return;
        initialized = true;
        try {
            if (schemeRepository.count() == 0) {
                List<GovernmentScheme> defaults = List.of(
                        createScheme("PM-KISAN Scheme", "Direct income support to all landholding farmers",
                                "income", "All landholding farmers", "₹6,000 per year", "31 Dec 2025", "active",
                                "https://pmkisan.gov.in",
                                "PM-KISAN provides financial benefit of ₹6,000 per year payable in three installments of ₹2,000.",
                                "[\"Aadhaar Card\",\"Land holding papers\",\"Bank account details\",\"Identity proof\"]",
                                "[\"All landholding farmer families\",\"Small and marginal farmers\"]",
                                "[\"Direct income support of ₹6,000/year\",\"No middlemen\",\"Direct bank transfer\"]",
                                "[\"Visit nearest CSC center\",\"Fill application form\",\"Submit documents\",\"Get verification done\"]"),
                        createScheme("Soil Health Card Scheme", "Free soil testing for farmers",
                                "testing", "All farmers", "Free testing", "Ongoing", "active",
                                "https://soilhealth.dac.gov.in",
                                "Provides soil health cards with crop-wise recommendations of nutrients and fertilizers.",
                                "[\"Aadhaar Card\",\"Land documents\",\"Farmer registration\"]",
                                "[\"All farmers in India\",\"Farmers with agricultural land\"]",
                                "[\"Free soil testing\",\"Personalized crop recommendations\",\"Improved soil fertility\"]",
                                "[\"Register at nearest agriculture office\",\"Provide soil sample\",\"Receive health card\"]"),
                        createScheme("Pradhan Mantri Fasal Bima Yojana", "Crop insurance at low premium",
                                "income", "All farmers growing notified crops", "Up to ₹2 lakh coverage", "30 Nov 2025",
                                "active",
                                "https://pmfby.gov.in",
                                "PMFBY provides financial support to farmers suffering crop loss due to natural calamities.",
                                "[\"Aadhaar Card\",\"Bank passbook\",\"Land records\",\"Sowing certificate\"]",
                                "[\"All farmers growing notified crops\",\"Both loanee and non-loanee farmers\"]",
                                "[\"Low premium rates\",\"Full sum insured\",\"Coverage for pre-sowing to harvest\"]",
                                "[\"Apply through bank or CSC\",\"Pay premium\",\"Get policy document\",\"Claim within 72 hours of loss\"]"),
                        createScheme("Kisan Credit Card", "Credit facility for farming needs",
                                "income", "All farmers", "Credit up to ₹3 lakh at 4% interest", "Ongoing", "active",
                                "https://www.nabard.org",
                                "KCC provides farmers with affordable credit for their agricultural needs.",
                                "[\"Aadhaar Card\",\"Land records\",\"Passport photo\",\"Bank account\"]",
                                "[\"All farmers\",\"Tenant farmers\",\"Sharecroppers\"]",
                                "[\"Credit at 4% interest\",\"Flexible repayment\",\"Insurance coverage included\"]",
                                "[\"Visit nearest bank\",\"Fill KCC application\",\"Submit documents\",\"Get card within 2 weeks\"]"));
                schemeRepository.saveAll(defaults);
                System.out.println("✅ Default government schemes inserted!");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not init schemes: " + e.getMessage());
        }
    }

    private GovernmentScheme createScheme(String title, String desc, String category,
            String eligibility, String subsidy, String deadline, String status,
            String link, String fullDesc, String docs, String criteria,
            String benefits, String process) {
        GovernmentScheme s = new GovernmentScheme();
        s.setTitle(title);
        s.setDescription(desc);
        s.setCategory(category);
        s.setEligibility(eligibility);
        s.setSubsidy(subsidy);
        s.setDeadline(deadline);
        s.setStatus(status);
        s.setOfficialLink(link);
        s.setFullDescription(fullDesc);
        s.setRequiredDocuments(docs);
        s.setEligibilityCriteria(criteria);
        s.setBenefits(benefits);
        s.setApplicationProcess(process);
        return s;
    }

    public ApiResponse getAllSchemes() {
        return new ApiResponse(true, "Schemes fetched", schemeRepository.findAll());
    }

    public ApiResponse getByCategory(String category) {
        return new ApiResponse(true, "Schemes fetched",
                category.equals("all") ? schemeRepository.findAll()
                        : schemeRepository.findByCategory(category));
    }

    public ApiResponse getSchemeById(Long id) {
        return schemeRepository.findById(id)
                .map(s -> new ApiResponse(true, "Scheme found", s))
                .orElse(new ApiResponse(false, "Scheme not found"));
    }
}