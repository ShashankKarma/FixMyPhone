import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { chatAPI } from '../services/api';
import { MessageSquare, Send, User, Store, Clock, ArrowLeft } from 'lucide-react';

const ChatPanel = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Determine user role
  const isCustomer = user?.roles?.some(r => r.name === 'ROLE_CUSTOMER' || r === 'ROLE_CUSTOMER');
  const isShopOwner = user?.roles?.some(r => r.name === 'ROLE_SHOP_OWNER' || r === 'ROLE_SHOP_OWNER');

  // Load chat rooms
  const loadRooms = async () => {
    try {
      setRoomsLoading(true);
      const data = await chatAPI.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // Refresh rooms list every 10 seconds
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for active room
  const loadMessages = async (room) => {
    if (!room) return;
    try {
      const data = await chatAPI.getMessages(room.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Poll for messages in active room
  useEffect(() => {
    if (activeRoom) {
      setMessagesLoading(true);
      loadMessages(activeRoom).then(() => setMessagesLoading(false));

      // Poll every 3 seconds for active chat
      pollIntervalRef.current = setInterval(() => {
        loadMessages(activeRoom);
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    try {
      setSending(true);
      const text = newMessage;
      setNewMessage('');
      const sentMsg = await chatAPI.sendMessage(activeRoom.id, text);
      setMessages(prev => [...prev, sentMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getRoomDisplayName = (room) => {
    if (isCustomer) {
      return room.shopName; // Customer sees shop name
    } else {
      return room.customerName; // Owner/Admin sees customer name
    }
  };

  return (
    <div className="h-[600px] bg-slate-950/40 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row">
      
      {/* Rooms Sidebar (visible if no active room on mobile, or always on desktop) */}
      <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/40 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-sky-400" />
          <h3 className="font-bold text-lg">Conversations</h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {roomsLoading && rooms.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-400"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No active conversations yet.
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left p-4 hover:bg-slate-800/30 transition flex items-center space-x-3 ${activeRoom?.id === room.id ? 'bg-sky-600/10 border-l-4 border-sky-500' : ''}`}
              >
                <div className="p-2.5 bg-slate-800 rounded-xl text-slate-400 flex-shrink-0">
                  {isCustomer ? <Store className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate text-white">
                    {getRoomDisplayName(room)}
                  </div>
                  <div className="text-slate-500 text-xxs flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>Opened: {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className={`flex-1 flex flex-col bg-slate-900/10 ${!activeRoom ? 'hidden md:flex justify-center items-center text-slate-500' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Active Room Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex items-center gap-3">
              <button
                onClick={() => setActiveRoom(null)}
                className="md:hidden p-1 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="p-2 bg-slate-800/60 rounded-xl text-sky-400">
                {isCustomer ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div>
                <h4 className="font-bold text-sm">{getRoomDisplayName(activeRoom)}</h4>
                <p className="text-slate-500 text-xxs">Channel ID: #{activeRoom.id}</p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                        {!isMe && (
                          <div className="text-xxs font-bold text-sky-400 mb-0.5">
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.content}</div>
                        <div className="text-[10px] text-slate-450 text-right mt-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/30 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500 text-white px-4 py-2.5 rounded-xl outline-none transition text-sm"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="p-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-xl transition flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-8 space-y-2">
            <MessageSquare className="h-10 w-10 text-slate-700 mx-auto" />
            <h4 className="font-bold text-white">Select a Chat</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Pick a conversation from the list to start messaging in real-time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatPanel;
