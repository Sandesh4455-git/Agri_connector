package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.dto.CropRequestDto;
import com.agriconnect.backend.model.Crop;
import com.agriconnect.backend.model.CropRequest;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.CropRepository;
import com.agriconnect.backend.repository.CropRequestRepository;
import com.agriconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CropRequestService {

    private final CropRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final DealService dealService;

    // ── Farmer views all requests for their crops ──────────────────────────
    public ApiResponse getRequestsForFarmer(String username) {
        User farmer = userRepository.findByUsername(username).orElse(null);
        if (farmer == null)
            return new ApiResponse(false, "User not found");
        List<CropRequest> requests = requestRepository.findByFarmer(farmer);
        return new ApiResponse(true, "Requests fetched", requests);
    }

    // ── Dealer/Customer sends a request ───────────────────────────────────
    public ApiResponse sendRequest(String senderUsername, CropRequestDto dto) {
        User sender = userRepository.findByUsername(senderUsername).orElse(null);
        if (sender == null)
            return new ApiResponse(false, "User not found");

        Crop crop = cropRepository.findById(dto.getCropId()).orElse(null);
        if (crop == null)
            return new ApiResponse(false, "Crop not found");

        CropRequest request = new CropRequest();
        request.setDealer(sender); // dealer field reuse करतो customer साठी पण
        request.setFarmer(crop.getFarmer());
        request.setCrop(crop);
        request.setQuantity(dto.getQuantity());
        request.setUnit(dto.getUnit() != null ? dto.getUnit() : crop.getUnit());
        request.setOfferedPrice(dto.getOfferedPrice());
        request.setMessage(dto.getMessage());
        request.setUrgency(dto.getUrgency());
        request.setDeliveryDate(dto.getDeliveryDate());
        request.setStatus(CropRequest.RequestStatus.PENDING);

        requestRepository.save(request);
        return new ApiResponse(true, "Request sent successfully", request);
    }

    // ── Farmer accepts request → deal auto-create ──────────────────────────
    public ApiResponse acceptRequest(String username, Long requestId) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getFarmer().getUsername().equals(username))
            return new ApiResponse(false, "Not authorized");

        request.setStatus(CropRequest.RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Crop quantity reduce करा
        Crop crop = request.getCrop();
        if (crop != null && request.getQuantity() != null) {
            double newQty = crop.getQuantity() - request.getQuantity();
            crop.setQuantity(Math.max(0, newQty));
            cropRepository.save(crop);
        }

        // Auto-create deal
        dealService.createDealFromRequest(request);

        return new ApiResponse(true, "Request accepted", request);
    }

    // ── Farmer rejects request ─────────────────────────────────────────────
    public ApiResponse rejectRequest(String username, Long requestId) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getFarmer().getUsername().equals(username))
            return new ApiResponse(false, "Not authorized");

        request.setStatus(CropRequest.RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);
        return new ApiResponse(true, "Request rejected", request);
    }

    // ── Farmer sends counter offer ─────────────────────────────────────────
    public ApiResponse negotiateRequest(String username, Long requestId, Double counterPrice) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getFarmer().getUsername().equals(username))
            return new ApiResponse(false, "Not authorized");

        request.setStatus(CropRequest.RequestStatus.NEGOTIATING);
        request.setCounterPrice(counterPrice);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);
        return new ApiResponse(true, "Counter offer sent to dealer", request);
    }

    // ── Dealer accepts farmer's counter offer ─────────────────────────────
    public ApiResponse dealerAcceptCounter(String dealerUsername, Long requestId) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getDealer().getUsername().equals(dealerUsername))
            return new ApiResponse(false, "Not authorized");
        if (request.getStatus() != CropRequest.RequestStatus.NEGOTIATING)
            return new ApiResponse(false, "No counter offer to accept");

        request.setOfferedPrice(request.getCounterPrice());
        request.setStatus(CropRequest.RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        dealService.createDealFromRequest(request);

        return new ApiResponse(true, "Counter offer accepted! Deal created.", request);
    }

    // ── Dealer sends new counter offer back to farmer ──────────────────────
    public ApiResponse dealerCounterOffer(String dealerUsername, Long requestId, Double newPrice) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getDealer().getUsername().equals(dealerUsername))
            return new ApiResponse(false, "Not authorized");

        request.setOfferedPrice(newPrice);
        request.setCounterPrice(null);
        request.setStatus(CropRequest.RequestStatus.PENDING);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        return new ApiResponse(true, "New offer sent to farmer", request);
    }

    // ── Dealer cancels request ─────────────────────────────────────────────
    public ApiResponse dealerCancelRequest(String dealerUsername, Long requestId) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getDealer().getUsername().equals(dealerUsername))
            return new ApiResponse(false, "Not authorized");

        request.setStatus(CropRequest.RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);
        return new ApiResponse(true, "Request cancelled", request);
    }

    // ── Dealer views their sent requests ──────────────────────────────────
    public ApiResponse getRequestsByDealer(String username) {
        User dealer = userRepository.findByUsername(username).orElse(null);
        if (dealer == null)
            return new ApiResponse(false, "User not found");
        List<CropRequest> requests = requestRepository.findByDealer(dealer);
        return new ApiResponse(true, "Requests fetched", requests);
    }

    // ── ✅ NEW: Customer views their sent requests ────────────────────────
    public ApiResponse getRequestsByCustomer(String username) {
        User customer = userRepository.findByUsername(username).orElse(null);
        if (customer == null)
            return new ApiResponse(false, "User not found");
        // dealer field मध्ये customer पण store होतो
        List<CropRequest> requests = requestRepository.findByDealer(customer);
        return new ApiResponse(true, "Requests fetched", requests);
    }

    // ── ✅ NEW: Customer cancels their request ────────────────────────────
    public ApiResponse customerCancelRequest(String customerUsername, Long requestId) {
        CropRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null)
            return new ApiResponse(false, "Request not found");
        if (!request.getDealer().getUsername().equals(customerUsername))
            return new ApiResponse(false, "Not authorized");

        request.setStatus(CropRequest.RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);
        return new ApiResponse(true, "Request cancelled", request);
    }
}