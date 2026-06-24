package com.fixmyphone.backend.modules.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByCustomerId(Long customerId);
    List<ChatRoom> findByShopId(Long shopId);
    Optional<ChatRoom> findByCustomerIdAndShopId(Long customerId, Long shopId);
    boolean existsByCustomerIdAndShopId(Long customerId, Long shopId);
}
