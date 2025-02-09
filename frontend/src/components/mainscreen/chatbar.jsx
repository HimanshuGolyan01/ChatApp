import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ChatBar = ({ searchResult, setSearchResult, chatUser, setChatUser, setCurrChat, setChats }) => {
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!searchResult || searchResult.length === 0) {
      axios.get("http://localhost:3000/fetchchat", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("jwt")
        }
      })
      .then(response => {
        const combinedData = response?.data?.map(item => {
          const otherUser = item.users.find(user => user._id !== userId);
          if (otherUser) {
            return { chatId: item._id, name: otherUser.name, pic: otherUser.pic, userId: otherUser._id };
          } else {
            return null;
          }
        }).filter(user => user !== null);
  
        if (combinedData) {
          setChatUser(combinedData);
        }
      })
      .catch(error => {
        console.error("Error fetching chat data:", error);
      });
    }
  }, [searchResult, userId, setChatUser]);

  const usersToDisplay = (searchResult && searchResult.length > 0) ? searchResult : chatUser;

  const createChatHandler = (user) => {
    const id = user.userId || user._id;
    axios.post("http://localhost:3000/createchat", {
        userId: id
    }, {
        headers: {
            "Authorization": localStorage.getItem("jwt"),
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        setChats(user.chatId);
        setCurrChat(user);
        setSearchResult([]);
    })
    .catch(error => {
        console.error("There was an error creating the chat!", error);
    });
  };

  const notify = () => {
    toast("Group chat button clicked!");
  };

  return (
    <div className="w-[25rem] mt-3 bg-gray-900 p-2 rounded-lg m-2 h-[88.5vh] text-white">
      <div className="flex justify-between">
        <div className="p-2 font-bold text-[20px] mt-3">My Chats</div>
        <button className="p-3 m-3 border-2 rounded-md text-white bg-gray-700 hover:bg-gray-600 font-semibold" onClick={notify}>Create Group Chat +</button>
      </div>
      {usersToDisplay && usersToDisplay.map((user, index) => (
        <div key={index} className="bg-gray-800 m-2 rounded-lg flex flex-row p-2 cursor-pointer border-2 border-gray-600 hover:bg-gray-700" onClick={() => createChatHandler(user)}>
          <img src={user.pic} alt="user" className="w-[50px] h-[50px] rounded-full" />
          <p className="font-bold my-auto ml-4">{user.name}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatBar;
