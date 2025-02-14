import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "http://localhost:3000";
const ChatApp = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currChat, setCurrChat] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socket = useRef();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();

  // Fetch existing chats
  useEffect(() => {
    axios
      .get("http://localhost:3000/fetchchat", {
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
      })
      .then((response) => {
        const chatList = response?.data?.map((chat) => {
          const otherUser = chat.users.find((user) => user._id !== userId);
          return otherUser ? { chatId: chat._id, ...otherUser } : null;
        }) || [];
        setChatUsers(chatList.filter(Boolean));
      })
      .catch((error) => console.error("Error fetching chats:", error));
  }, [userId]);

  // Connect to socket
  useEffect(() => {
    if (userId) {
      socket.current = io(ENDPOINT);
      socket.current.emit("setup", { userId });
      socket.current.on("connected", () => setSocketConnected(true));

      socket.current.on("message received", (newMessageReceived) => {
        if (currChat && newMessageReceived.chat._id === chatId) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });
    }

    return () => socket.current?.disconnect();
  }, [userId, currChat, chatId]);

  // Create or open chat
  const createChatHandler = async (user) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/createchat",
        { userId: user._id },
        { headers: { Authorization: "Bearer " + localStorage.getItem("jwt") } }
      );

      setChatId(response.data.chatId);
      setCurrChat(user);
      setMessages([]);
      fetchMessages(response.data.chatId);
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  // Fetch messages of the chat
  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/fetch-messages/${chatId}`,
        { headers: { Authorization: "Bearer " + localStorage.getItem("jwt") } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Search users
  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:3000/alluser?search=${searchQuery}`,
        { headers: { Authorization: "Bearer " + localStorage.getItem("jwt") } }
      );
      setSearchResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      const response = await axios.post(
        "http://localhost:3000/send-message",
        { content: newMessage, chatId: chats }, // Ensure chatId exists
        { headers: { Authorization: "Bearer " + localStorage.getItem("jwt") } }
      );
  
      if (response.data?.message) {
        setMessages([...messages, response.data.message]);
        socket.current.emit("new message", response.data.message);
        setNewMessage(""); // Clear input after sending
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-[80%] h-[90%] bg-white shadow-lg rounded-xl overflow-hidden flex flex-col">
        <div className="bg-gray-200 p-4 flex justify-between items-center border-b">
          <div className="flex gap-2">
            <input
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-60 outline-none"
              type="text"
              placeholder="Search User ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={searchHandler}>
              Search
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-700">LOOPCHAT</h1>
          <div className="relative">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              className="h-9 w-9 rounded-full cursor-pointer border border-gray-400"
              onClick={() => setDropdownVisible(!dropdownVisible)}
              alt="Profile"
            />
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 cursor-pointer hover:bg-gray-100">{userName}</div>
                <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => navigate("/login")}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1">
          <div className="w-1/3 bg-gray-100 p-4 border-r overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-600 mb-3">Chats</h2>
            {(searchResults.length > 0 ? searchResults : chatUsers).map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-200 rounded-lg transition"
                onClick={() => createChatHandler(user)}
              >
                <img src={user.pic} alt="user" className="w-10 h-10 rounded-full border-2 border-gray-300" />
                <p className="text-gray-700 font-medium">{user.name}</p>
              </div>
            ))}
          </div>

          <div className="w-2/3 flex flex-col bg-gray-50">
            {currChat ? (
              <>
                <div className="p-3 flex items-center border">
                  <img src={currChat.pic} className="w-8 h-8 rounded-full mr-2" alt="profile" />
                  <span className="text-gray-700 font-semibold">{currChat.name}</span>
                </div>
                <div className="p-3 flex flex-col flex-grow overflow-y-auto">
                  {messages.map((msg, index) => (
                    <p key={index} className="p-2 bg-gray-200 rounded-lg my-1">{msg.content}</p>
                  ))}
                </div>
                <div className="p-3 flex gap-2 border-t">
                  <input className="flex-1 p-2 border rounded-lg" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </>
            ) : <p className="text-center text-gray-500 mt-16">Start a chat</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
