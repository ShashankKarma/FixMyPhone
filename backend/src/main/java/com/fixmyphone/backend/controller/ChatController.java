package com.fixmyphone.backend.controller;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.modules.chat.*;
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
}
