package com.fixmyphone.backend.modules.shop;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.exception.UnauthorizedException;
import com.fixmyphone.backend.modules.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RepairShopServiceImpl implements RepairShopService {

    @Autowired
    private RepairShopRepository repairShopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Override
    public RepairShopResponse createShop(RepairShopRequest request, User owner) {
        if (repairShopRepository.existsByOwnerId(owner.getId())) {
            throw new IllegalArgumentException("You already own a registered repair shop!");
        }

        RepairShop shop = RepairShop.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .email(request.getEmail())
                .rating(BigDecimal.ZERO)
                .totalReviews(0)
                .isApproved(false) // Admin must approve
                .build();

        RepairShop savedShop = repairShopRepository.save(shop);
        return mapToResponse(savedShop);
    }

    @Override
    public RepairShopResponse updateShop(RepairShopRequest request, User owner) {
        RepairShop shop = repairShopRepository.findByOwnerId(owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found for this user"));

        shop.setName(request.getName());
        shop.setDescription(request.getDescription());
        shop.setAddress(request.getAddress());
        shop.setCity(request.getCity());
        shop.setState(request.getState());
        shop.setZipCode(request.getZipCode());
        shop.setLatitude(request.getLatitude());
        shop.setLongitude(request.getLongitude());
        shop.setPhone(request.getPhone());
        shop.setEmail(request.getEmail());

        RepairShop updatedShop = repairShopRepository.save(shop);
        return mapToResponse(updatedShop);
    }

    @Override
    @Transactional(readOnly = true)
    public RepairShopResponse getShopById(Long id) {
        RepairShop shop = repairShopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found with id: " + id));
        return mapToResponse(shop);
    }

    @Override
    @Transactional(readOnly = true)
    public RepairShopResponse getShopByOwner(Long ownerId) {
        RepairShop shop = repairShopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found for owner ID: " + ownerId));
        return mapToResponse(shop);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairShopResponse> getAllApprovedShops() {
        return repairShopRepository.findByIsApproved(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairShopResponse> getApprovedShopsByCity(String city) {
        return repairShopRepository.findByCityIgnoreCaseAndIsApproved(city, true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairShopResponse> getAllShopsForAdmin() {
        return repairShopRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RepairShopResponse approveShop(Long id, boolean approve) {
        RepairShop shop = repairShopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found"));
        shop.setIsApproved(approve);
        return mapToResponse(repairShopRepository.save(shop));
    }

    // Services Offered

    @Override
    public ServiceResponse addService(Long shopId, ServiceRequest request, User owner) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Shop not found"));

        if (!shop.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to add services to this shop");
        }

        com.fixmyphone.backend.modules.shop.Service service = com.fixmyphone.backend.modules.shop.Service.builder()
                .shop(shop)
                .name(request.getName())
                .customName(request.getCustomName())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .build();

        com.fixmyphone.backend.modules.shop.Service savedService = serviceRepository.save(service);
        return mapToServiceResponse(savedService);
    }

    @Override
    public ServiceResponse updateService(Long serviceId, ServiceRequest request, User owner) {
        com.fixmyphone.backend.modules.shop.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.getShop().getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to update services in this shop");
        }

        service.setName(request.getName());
        service.setCustomName(request.getCustomName());
        service.setPrice(request.getPrice());
        service.setDurationMinutes(request.getDurationMinutes());
        if (request.getIsAvailable() != null) {
            service.setIsAvailable(request.getIsAvailable());
        }

        return mapToServiceResponse(serviceRepository.save(service));
    }

    @Override
    public void deleteService(Long serviceId, User owner) {
        com.fixmyphone.backend.modules.shop.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.getShop().getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to delete services from this shop");
        }

        serviceRepository.delete(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicesByShop(Long shopId, boolean onlyAvailable) {
        List<com.fixmyphone.backend.modules.shop.Service> services;
        if (onlyAvailable) {
            services = serviceRepository.findByShopIdAndIsAvailable(shopId, true);
        } else {
            services = serviceRepository.findByShopId(shopId);
        }
        return services.stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    private RepairShopResponse mapToResponse(RepairShop shop) {
        return RepairShopResponse.builder()
                .id(shop.getId())
                .ownerId(shop.getOwner().getId())
                .ownerName(shop.getOwner().getName())
                .name(shop.getName())
                .description(shop.getDescription())
                .address(shop.getAddress())
                .city(shop.getCity())
                .state(shop.getState())
                .zipCode(shop.getZipCode())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .phone(shop.getPhone())
                .email(shop.getEmail())
                .rating(shop.getRating())
                .totalReviews(shop.getTotalReviews())
                .isApproved(shop.getIsApproved())
                .createdAt(shop.getCreatedAt())
                .build();
    }

    private ServiceResponse mapToServiceResponse(com.fixmyphone.backend.modules.shop.Service service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .shopId(service.getShop().getId())
                .name(service.getName())
                .customName(service.getCustomName())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .isAvailable(service.getIsAvailable())
                .build();
    }
}
