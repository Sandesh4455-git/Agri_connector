package com.agriconnect.backend.service;

import com.agriconnect.backend.dto.ApiResponse;
import com.agriconnect.backend.model.CropRequest;
import com.agriconnect.backend.model.Deal;
import com.agriconnect.backend.repository.DealRepository;
import com.agriconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final UserRepository userRepository;

    public Deal createDealFromRequest(CropRequest request) {
        Deal deal = new Deal();
        deal.setFarmer(request.getFarmer());
        deal.setDealer(request.getDealer());
        deal.setCrop(request.getCrop());
        deal.setQuantity(request.getQuantity());
        deal.setUnit(request.getUnit());
        deal.setPrice(request.getOfferedPrice());
        deal.setTotalAmount(request.getQuantity() * request.getOfferedPrice());
        deal.setStatus(Deal.DealStatus.ACTIVE);
        return dealRepository.save(deal);
    }

    public ApiResponse getFarmerDeals(String username) {
        var farmer = userRepository.findByUsername(username).orElse(null);
        if (farmer == null)
            return new ApiResponse(false, "User not found");
        List<Deal> deals = dealRepository.findByFarmer(farmer);
        return new ApiResponse(true, "Deals fetched", deals);
    }

    public ApiResponse getDealerDeals(String username) {
        var dealer = userRepository.findByUsername(username).orElse(null);
        if (dealer == null)
            return new ApiResponse(false, "User not found");
        List<Deal> deals = dealRepository.findByDealer(dealer);
        return new ApiResponse(true, "Deals fetched", deals);
    }

    public ApiResponse completeDeal(String username, Long dealId) {
        Deal deal = dealRepository.findById(dealId).orElse(null);
        if (deal == null)
            return new ApiResponse(false, "Deal not found");
        if (!deal.getFarmer().getUsername().equals(username))
            return new ApiResponse(false, "Not authorized");
        deal.setStatus(Deal.DealStatus.COMPLETED);
        deal.setDeliveryStatus(Deal.DeliveryStatus.DELIVERED);
        deal.setPaymentStatus(Deal.PaymentStatus.PAID);
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return new ApiResponse(true, "Deal completed", deal);
    }

    public ApiResponse cancelDeal(String username, Long dealId) {
        Deal deal = dealRepository.findById(dealId).orElse(null);
        if (deal == null)
            return new ApiResponse(false, "Deal not found");
        if (!deal.getFarmer().getUsername().equals(username))
            return new ApiResponse(false, "Not authorized");
        deal.setStatus(Deal.DealStatus.CANCELLED);
        deal.setDeliveryStatus(Deal.DeliveryStatus.CANCELLED);
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return new ApiResponse(true, "Deal cancelled", deal);
    }
}