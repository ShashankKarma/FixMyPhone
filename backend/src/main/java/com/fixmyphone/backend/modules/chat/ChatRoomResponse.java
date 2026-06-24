package com.fixmyphone.backend.modules.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long shopId;
    private String shopName;
    private LocalDateTime createdAt;
}
