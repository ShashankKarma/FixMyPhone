package com.fixmyphone.backend.modules.shop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepairShopRepository extends JpaRepository<RepairShop, Long> {
    List<RepairShop> findByIsApproved(Boolean isApproved);
    List<RepairShop> findByCityIgnoreCaseAndIsApproved(String city, Boolean isApproved);
    Optional<RepairShop> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);

    @org.springframework.data.jpa.repository.Query("SELECT s.owner.id FROM RepairShop s WHERE s.id = :shopId")
    Optional<Long> findOwnerIdByShopId(@org.springframework.data.repository.query.Param("shopId") Long shopId);
}
