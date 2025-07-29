import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Search } from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations } = useQuery({
    queryKey: ['/api/chat/conversations'],
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
  });

  const { data: messages } = useQuery({
    queryKey: ['/api/chat/messages', selectedUser?.id],
    enabled: !!selectedUser,
    refetchInterval: 2000, // Poll more frequently for active conversation
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      return await apiRequest("POST", "/api/chat/messages", data);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (senderId: string) => {
      return await apiRequest("POST", "/api/chat/mark-read", { senderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: newMessage.trim(),
    });
  };

  const handleSelectUser = (conversation: any) => {
    setSelectedUser(conversation.user);
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation.user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
          
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="text-bsf-green" size={20} />
                  Conversations
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input placeholder="Search conversations..." className="pl-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                {conversations?.map((conversation: any) => (
                  <div
                    key={conversation.user.id}
                    onClick={() => handleSelectUser(conversation)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      selectedUser?.id === conversation.user.id ? 'bg-bsf-green-light' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-bsf-green rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {conversation.user.firstName?.[0]}{conversation.user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-dark-gray text-sm">
                            {conversation.user.firstName} {conversation.user.lastName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!conversations?.length && (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start a conversation with alumni from the directory</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-bsf-green rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-gray">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages?.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-bsf-green text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id 
                                ? 'text-bsf-green-light' 
                                : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {!messages?.length && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Start a conversation with {selectedUser.firstName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center space-x-3">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto mb-4 text-gray-300" size={64} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                    <p className="text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
