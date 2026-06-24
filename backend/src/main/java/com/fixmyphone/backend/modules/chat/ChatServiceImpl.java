package com.fixmyphone.backend.modules.chat;

import com.fixmyphone.backend.exception.ResourceNotFoundException;
import com.fixmyphone.backend.exception.UnauthorizedException;
import com.fixmyphone.backend.modules.shop.RepairShop;
import com.fixmyphone.backend.modules.shop.RepairShopRepository;
import com.fixmyphone.backend.modules.user.User;
import com.fixmyphone.backend.modules.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private RepairShopRepository repairShopRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ChatRoomResponse initiateChat(Long shopId, User customer) {
        RepairShop shop = repairShopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));

        Optional<ChatRoom> existingRoom = chatRoomRepository.findByCustomerIdAndShopId(customer.getId(), shopId);
        if (existingRoom.isPresent()) {
            return mapToRoomResponse(existingRoom.get());
        }

        ChatRoom newRoom = ChatRoom.builder()
                .customer(customer)
                .shop(shop)
                .build();

        return mapToRoomResponse(chatRoomRepository.save(newRoom));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getChatRooms(User user) {
        boolean isCustomer = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_CUSTOMER"));
        boolean isShopOwner = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_SHOP_OWNER"));

        if (isCustomer) {
            return chatRoomRepository.findByCustomerId(user.getId()).stream()
                    .map(this::mapToRoomResponse)
                    .collect(Collectors.toList());
        } else if (isShopOwner) {
            RepairShop shop = repairShopRepository.findByOwnerId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found for this user"));
            return chatRoomRepository.findByShopId(shop.getId()).stream()
                    .map(this::mapToRoomResponse)
                    .collect(Collectors.toList());
        } else {
            // Admin can see all rooms
            return chatRoomRepository.findAll().stream()
                    .map(this::mapToRoomResponse)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<ChatMessageResponse> getChatMessages(Long roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        boolean isCustomer = room.getCustomer().getId().equals(user.getId());
        boolean isShopOwner = room.getShop().getOwner().getId().equals(user.getId());

        if (!isAdmin && !isCustomer && !isShopOwner) {
            throw new UnauthorizedException("You are not authorized to view messages in this chat room");
        }

        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId);
        
        // Mark messages as read if sent by the other party
        List<ChatMessage> unreadMessages = messages.stream()
                .filter(msg -> !msg.getSender().getId().equals(user.getId()) && !msg.getIsRead())
                .peek(msg -> msg.setIsRead(true))
                .collect(Collectors.toList());

        if (!unreadMessages.isEmpty()) {
            chatMessageRepository.saveAll(unreadMessages);
        }

        return messages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ChatMessageResponse sendMessage(Long roomId, ChatMessageRequest request, User sender) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        boolean isAdmin = sender.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        boolean isCustomer = room.getCustomer().getId().equals(sender.getId());
        boolean isShopOwner = room.getShop().getOwner().getId().equals(sender.getId());

        if (!isAdmin && !isCustomer && !isShopOwner) {
            throw new UnauthorizedException("You are not authorized to send messages in this chat room");
        }

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();

        return mapToMessageResponse(chatMessageRepository.save(message));
    }

    private ChatRoomResponse mapToRoomResponse(ChatRoom room) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .customerId(room.getCustomer().getId())
                .customerName(room.getCustomer().getName())
                .shopId(room.getShop().getId())
                .shopName(room.getShop().getName())
                .createdAt(room.getCreatedAt())
                .build();
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .imageUrl(message.getImageUrl())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
