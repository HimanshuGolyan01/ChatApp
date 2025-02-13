import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "https://chatify-1cxv.onrender.com/";

const ChatApp = () => {
  const [chatUser, setChatUser] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [currChat, setCurrChat] = useState();
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socket = useRef();
  const userId = localStorage.getItem("userId");
  const myProfile = localStorage.getItem("userName");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/fetchchat", {
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
    .then(response => {
      const combinedData = response?.data?.map(item => {
        const otherUser = item.users.find(user => user._id !== userId);
        return otherUser ? { chatId: item._id, name: otherUser.name, pic: otherUser.pic, userId: otherUser._id } : null;
      }).filter(user => user);
      setChatUser(combinedData);
    })
    .catch(error => console.error("Error fetching chat data:", error));
  }, [userId]);

  useEffect(() => {
    if (userId) {
      socket.current = io(ENDPOINT);
      socket.current.emit("setup", { userId });
      socket.current.on("connected", () => setSocketConnected(true));
      socket.current.on("message received", (newMessageReceived) => {
        if (newMessageReceived.chat._id === chats) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });
    }
    return () => socket.current?.disconnect();
  }, [userId, chats]);

  const createChatHandler = (user) => {
    axios.post("http://localhost:3000/createchat", { userId: user.userId }, {
      headers: { Authorization: localStorage.getItem("jwt") },
    })
    .then(response => {
      setChats(user.chatId);
      setCurrChat(user);
      setSearchResult([]); 
    })
    .catch(error => console.error("Error creating chat:", error));
  };

  const searchHandler = (e) => {
    e.preventDefault();
    axios.get(`http://localhost:3000/alluser?search=${searchResult}`, {
      headers: { Authorization: localStorage.getItem("jwt") },
    })
    .then(response => setSearchResult(response.data))
    .catch(error => console.error("Error searching users:", error));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    axios.post("http://localhost:3000/send-message", {
      content: newMessage,
      chatId: chats
    }, {
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
    .then(response => {
      setNewMessage("");
      socket.current.emit("new message", response.data.message);
      setMessages([...messages, response.data.message]);
    })
    .catch(error => console.error("Error sending message:", error));
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      {/* Chat Container */}
      <div className="w-[80%] h-[90%] bg-white shadow-lg rounded-xl overflow-hidden flex flex-col">
        {/* Navbar */}
        <div className="bg-gray-200 p-4 flex justify-between items-center border-b">
          <div className="flex gap-2">
            <input 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-60 outline-none" 
              type="text" 
              placeholder="Search User ..." 
              onChange={(e) => setSearchResult(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={searchHandler}>Search</button>
          </div>
          <h1 className="text-xl font-bold text-gray-700">LOOPCHAT</h1>
          <div className="relative">
            <img 
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png" 
              className="h-9 w-9 rounded-full cursor-pointer border border-gray-400" 
              onClick={() => setDropdownVisible(!dropdownVisible)}
            />
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 cursor-pointer hover:bg-gray-100">{myProfile}</div>
                <div className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => navigate("/login")}>Logout</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Section */}
        <div className="flex flex-1">
          {/* Chat List */}
          <div className="w-1/3 bg-gray-100 p-4 border-r overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-600 mb-3">Chats</h2>
            {(searchResult.length ? searchResult : chatUser).map((user, index) => (
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

          {/* Chat Messages */}
          <div className="w-2/3 flex flex-col bg-gray-50">
            {currChat && chats ? (
              <>
                {/* Chat Header */}
                <div className="bg-white p-3 flex items-center border">
                  <img src={currChat.pic} className="w-8 h-8 rounded-full mr-2" alt="profile" />
                  <span className="text-gray-700 font-semibold">{currChat.name}</span>
                </div>

                {/* Messages (Now Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 h-[70%]">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender._id !== currChat.userId ? "justify-end" : "justify-start"}`}
                    >
                      <span className={`px-4 py-2 rounded-lg text-sm shadow ${msg.sender._id !== currChat.userId ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}>
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Input Box */}
                <div className="border-t p-3 flex gap-2">
                  <input 
                    className="flex-1 p-2 border rounded-lg outline-none bg-white" 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
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
