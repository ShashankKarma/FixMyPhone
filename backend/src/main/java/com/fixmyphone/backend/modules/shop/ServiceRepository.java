package com.fixmyphone.backend.modules.shop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByShopId(Long shopId);
    List<Service> findByShopIdAndIsAvailable(Long shopId, Boolean isAvailable);
}
