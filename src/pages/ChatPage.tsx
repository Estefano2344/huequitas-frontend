import { Send, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const MAX_MESSAGE_LENGTH = 150;

  useEffect(() => {
    if (!user) return;

    // Conectar a Socket.IO
    const socket = io('http://localhost:3003', {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Escuchar eventos de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al chat service');
      setLoading(false);
      
      // Unirse a la sala "general"
      socket.emit('join-room', 'general');
    });

    // Recibir historial de mensajes
    socket.on('message-history', (history: any[]) => {
      console.log('📜 Historial de mensajes:', history);
      const formattedMessages: ChatMessage[] = history.map((msg, index) => ({
        id: msg._id || `${msg.userId}-${index}`,
        userId: msg.userId,
        userName: msg.userName,
        message: msg.message,
        timestamp: msg.createdAt || new Date().toISOString()
      }));
      setMessages(formattedMessages);
    });

    // Recibir nuevo mensaje
    socket.on('receive-message', (messageData: any) => {
      console.log('📨 Nuevo mensaje:', messageData);
      const newMsg: ChatMessage = {
        id: messageData._id || `${messageData.userId}-${Date.now()}`,
        userId: messageData.userId,
        userName: messageData.userName,
        message: messageData.message,
        timestamp: messageData.createdAt || new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    // Manejar errores
    socket.on('error', (error: any) => {
      console.error('❌ Error en el chat:', error);
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log('⚠️ Desconectado del chat service');
      setLoading(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !user) return;

    setSending(true);
    try {
      // Enviar mensaje vía Socket.IO
      socketRef.current?.emit('send-message', {
        userId: user.id,
        userName: user.name,
        message: newMessage,
        room: 'general'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Community Chat</h1>
                <p className="text-orange-100">Discuss your favorite huecas with fellow food lovers</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">3 Online</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwnMessage = message.userId === user?.id || message.userName === user?.name;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-sm font-semibold text-gray-700">
                              {message.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                      placeholder="Type your message..."
                      maxLength={MAX_MESSAGE_LENGTH}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                      disabled={sending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
                <div className="flex justify-end">
                  <span className={`text-xs font-medium ${newMessage.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                    {newMessage.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
