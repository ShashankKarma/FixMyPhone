package com.fixmyphone.backend.modules.chat;

import com.fixmyphone.backend.modules.user.User;
import java.util.List;

public interface ChatService {
    ChatRoomResponse initiateChat(Long shopId, User customer);
    ChatRoomResponse initiateChatByOwner(Long customerId, User owner);
    List<ChatRoomResponse> getChatRooms(User user);
    List<ChatMessageResponse> getChatMessages(Long roomId, User user);
    ChatMessageResponse sendMessage(Long roomId, ChatMessageRequest request, User sender);
}
