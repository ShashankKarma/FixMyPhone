package com.fixmyphone.backend.modules.shop;

import com.fixmyphone.backend.modules.user.User;
import java.util.List;

public interface RepairShopService {
    RepairShopResponse createShop(RepairShopRequest request, User owner);
    RepairShopResponse updateShop(RepairShopRequest request, User owner);
    RepairShopResponse getShopById(Long id);
    RepairShopResponse getShopByOwner(Long ownerId);
    List<RepairShopResponse> getAllApprovedShops();
    List<RepairShopResponse> getApprovedShopsByCity(String city);
    List<RepairShopResponse> getAllShopsForAdmin();
    RepairShopResponse approveShop(Long id, boolean approve);

    // Services Offered
    ServiceResponse addService(Long shopId, ServiceRequest request, User owner);
    ServiceResponse updateService(Long serviceId, ServiceRequest request, User owner);
    void deleteService(Long serviceId, User owner);
    List<ServiceResponse> getServicesByShop(Long shopId, boolean onlyAvailable);
}
