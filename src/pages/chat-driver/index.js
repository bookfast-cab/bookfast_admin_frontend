import { useState, useEffect, useRef } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Card,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  Avatar,
  Badge,
  InputAdornment,
  Paper,
  Fade,
  Tooltip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import ProfileAvatar from 'src/layouts/components/ProfileAvatar';
import { styled } from '@mui/material/styles';
import io from 'socket.io-client';

const ChatContainer = styled(Card)(({ theme }) => ({
  height: '85vh',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
  backgroundColor: '#fdfdfd'
}));

const SidebarWrapper = styled(Box)(({ theme }) => ({
  width: '350px',
  borderRight: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff'
}));

const MessageBubble = styled(Paper)(({ theme, isadmin }) => ({
  padding: '10px 16px',
  maxWidth: '75%',
  borderRadius: isadmin === 'true' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
  backgroundColor: isadmin === 'true' ? theme.palette.primary.main : '#f0f2f5',
  color: isadmin === 'true' ? '#fff' : '#000',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  fontSize: '14px',
  lineHeight: 1.5,
  position: 'relative',
  marginBottom: '4px'
}));

const DriverItem = styled(ListItem)(({ theme, selected }) => ({
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderRadius: '12px',
  margin: '4px 8px',
  width: 'calc(100% - 16px)',
  backgroundColor: selected ? 'rgba(145, 85, 253, 0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(145, 85, 253, 0.04)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(145, 85, 253, 0.1) !important',
  }
}));

const DriverChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedDriverRef = useRef(null);

  useEffect(() => {
    selectedDriverRef.current = selectedDriver;
  }, [selectedDriver]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }

    return null;

  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_APP_API_URL;

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    
    const socket = io(`http://localhost:3300/adminSocket`, {

      auth: { token }

    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Admin Socket');
    });

    socket.on('new_message', (data) => {

      console.log('New message received:', data);
      
      handleIncomingMessage(data);
    });

    socket.on('connect', () => {
      console.log('🟢 Admin socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.log('🔴 Socket connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🟡 Admin socket disconnected:', reason);
    });


    return () => {
      socket.disconnect();
    };
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.get(`${API_BASE_URL}chat/admin/conversations`, {

        headers: { Authorization: token }

      });
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (driverId) => {
    console.log("Fetching history for driverId:", driverId);
    try {
      setHistoryLoading(true);
      const token = getAuthToken();

      const response = await axios.get(`${API_BASE_URL}chat/admin/history/${driverId}`, {

        headers: { Authorization: token }

      });
      console.log("History API Response:", response.data);
      if (response.data.success) {
        setMessages(response.data.data);

        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    fetchHistory(driver.driverId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDriver) return;

    const token = getAuthToken();
    try {
      const response = await axios.post(`${API_BASE_URL}chat/admin/send`, {
        receiverId: selectedDriver.driverId,
        receiverType: 'driver',
        message: newMessage,
        messageType: 'text'
      }, {
        headers: { Authorization: token }
      });

      if (response.data.success) {
        const sentMsg = response.data.data;
        setMessages(prev => [...prev, sentMsg]);
        setNewMessage("");

        // Update sidebar with last message

        updateSidebar(sentMsg);
      }
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleIncomingMessage = (msg) => {
    console.log("Incoming message processing:", msg);

    const currentSelected = selectedDriverRef.current;
    const activeDriverId = currentSelected ? Number(currentSelected.driverId) : null;
    const senderId = Number(msg.sender_id);
    const receiverId = Number(msg.receiver_id);
    const msgDriverId = msg.sender_type === 'driver' ? senderId : receiverId;

    if (activeDriverId && msgDriverId === activeDriverId) {

      // Append to messages list if this driver is currently selected

      setMessages(prev => [...prev, msg]);

      // Mark as read in backend since we are looking at the chat

      if (msg.sender_type === 'driver') {
        markAsRead(activeDriverId);
      }
    }

    updateSidebar(msg);
  };

  const markAsRead = async (driverId) => {
    try {
      const token = getAuthToken();

    

      await axios.get(`${API_BASE_URL}chat/admin/history/${driverId}`, {
        headers: { Authorization: token }
      });

     
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };


  const updateSidebar = (msg) => {
    setConversations(prev => {
      const updated = [...prev];
      const driverId = msg.sender_type === 'driver' ? msg.sender_id : msg.receiver_id;
      const index = updated.findIndex(c => c.driverId === driverId);
      const currentSelected = selectedDriverRef.current;

      if (index !== -1) {
        const conversation = { ...updated[index] };
        conversation.lastMessage = msg.message;
        conversation.lastMessageTime = msg.created_at;

        if (msg.sender_type === 'driver' && (!currentSelected || Number(currentSelected.driverId) !== driverId)) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        
        updated.splice(index, 1);
        updated.unshift(conversation);
      } else {
        fetchConversations();
      }

      return updated;

    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f5fa' }}>
      <ChatContainer>
        
        <SidebarWrapper>
          <Box p={4} sx={{ borderBottom: '1px solid #eee' }}>
            <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
              Messages
            </Typography>
            <TextField
              size="small"
              placeholder="Search conversations..."
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#f8f9fa', borderRadius: '8px', '& fieldset': { border: 'none' } }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ pt: 1 }}>
                {conversations.length === 0 && (
                  <Typography align="center" color="textSecondary" sx={{ mt: 4 }}>
                    No conversations found
                  </Typography>
                )}
                {conversations
                  .filter(c => c.driverName?.toLowerCase().includes(searchText.toLowerCase()))
                  .map((conv) => (
                    <DriverItem
                      key={conv.sessionId}
                      selected={selectedDriver?.driverId === conv.driverId}
                      onClick={() => handleSelectDriver(conv)}
                    >
                      <Box display="flex" alignItems="center" gap={3} width="100%">
                        <Avatar
                          src={conv.driverProfile ? `${API_BASE_URL}/driverProfilePic/${conv.driverProfile}` : undefined}
                          sx={{ width: 40, height: 40 }}
                        >
                          {conv.driverName?.charAt(0)}
                        </Avatar>

                        <Box flexGrow={1} minWidth={0}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight={conv.unreadCount > 0 ? 700 : 500} noWrap>
                              {conv.driverName || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatTime(conv.lastMessageTime)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" noWrap sx={{ fontStyle: conv.unreadCount > 0 ? 'italic' : 'normal' }}>
                            {conv.lastMessage || 'No messages yet'}
                          </Typography>
                        </Box>

                        {conv.unreadCount > 0 && (
                          <Badge badgeContent={conv.unreadCount} color="primary" />
                        )}
                      </Box>
                    </DriverItem>
                  ))}
              </List>
            )}
          </Box>
        </SidebarWrapper>

        {/* Right: Chat Window */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
          {selectedDriver ? (
            <>
              {/* Chat Header */}
              <Box p={3} sx={{ borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Avatar
                    src={selectedDriver.driverProfile ? `${API_BASE_URL}/driverProfilePic/${selectedDriver.driverProfile}` : undefined}
                  >
                    {selectedDriver.driverName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedDriver.driverName || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                  <IconButton>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Chat Messages */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#fdfdfd' }}>
                {historyLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress size={30} />
                  </Box>
                ) : (
                  <>
                    {messages.length === 0 && (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" sx={{ opacity: 0.5 }}>
                        <Typography variant="body2">Start a conversation with {selectedDriver.driverName}</Typography>
                      </Box>
                    )}
                    {messages.map((msg, idx) => (
                      <Box
                        key={msg.id || idx}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.sender_type === "admin" ? "flex-end" : "flex-start",
                        }}
                      >
                        <MessageBubble isadmin={msg.sender_type === "admin" ? "true" : "false"} elevation={0}>
                          {msg.message}
                        </MessageBubble>
                        <Typography variant="caption" sx={{ mt: 0.5, px: 1, fontSize: '10px', color: 'text.secondary' }}>
                          {formatTime(msg.created_at)}
                        </Typography>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Chat Input */}
              <Box p={3} sx={{ borderTop: '1px solid #eee' }}>
                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { bgcolor: '#eee' }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={4}>
              <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'rgba(145, 85, 253, 0.1)', color: 'primary.main' }}>
                <SendIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>Select a Driver</Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 300 }}>
                Choose a driver from the list on the left to start chatting or view conversation history.
              </Typography>
            </Box>
          )}
        </Box>
      </ChatContainer>
    </Box>
  );
};

export default DriverChatPage;
