package com.fixmyphone.backend.controller;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.modules.chat.*;
import com.fixmyphone.backend.modules.shop.RepairShop;
import com.fixmyphone.backend.modules.user.User;
import com.fixmyphone.backend.modules.user.UserRepository;
import com.fixmyphone.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @PostMapping("/shops/{shopId}/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ChatRoomResponse> initiateChat(
            @PathVariable Long shopId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User customer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(chatService.initiateChat(shopId, customer));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getChatRooms(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(chatService.getChatRooms(user));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(chatService.getChatMessages(roomId, user));
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long roomId,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User sender = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(chatService.sendMessage(roomId, request, sender));
    }

    @GetMapping("/debug/db-check")
    public ResponseEntity<?> dbCheck() {
        try {
            java.util.Map<String, Object> status = new java.util.HashMap<>();
            status.put("chat_rooms_count", chatRoomRepository.count());
            status.put("messages_count", chatMessageRepository.count());
            
            // Diagnostics for rooms
            java.util.List<java.util.Map<String, Object>> roomsDetail = new java.util.ArrayList<>();
            for (ChatRoom room : chatRoomRepository.findAll()) {
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("room_id", room.getId());
                detail.put("customer_id", room.getCustomer() != null ? room.getCustomer().getId() : null);
                detail.put("customer_email", room.getCustomer() != null ? room.getCustomer().getEmail() : null);
                
                RepairShop shop = room.getShop();
                detail.put("shop_id", shop != null ? shop.getId() : null);
                detail.put("shop_name", shop != null ? shop.getName() : null);
                
                if (shop != null && shop.getOwner() != null) {
                    detail.put("shop_owner_id", shop.getOwner().getId());
                    detail.put("shop_owner_email", shop.getOwner().getEmail());
                } else {
                    detail.put("shop_owner_id", null);
                    detail.put("shop_owner_email", null);
                }
                roomsDetail.add(detail);
            }
            status.put("rooms_detail", roomsDetail);
            
            // Diagnostics for users
            java.util.List<java.util.Map<String, Object>> usersDetail = new java.util.ArrayList<>();
            for (User u : userRepository.findAll()) {
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("user_id", u.getId());
                detail.put("email", u.getEmail());
                detail.put("roles", u.getRoles().stream().map(r -> r.getName().name()).collect(java.util.stream.Collectors.toList()));
                usersDetail.add(detail);
            }
            status.put("users_detail", usersDetail);
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body(sw.toString());
        }
    }
}
