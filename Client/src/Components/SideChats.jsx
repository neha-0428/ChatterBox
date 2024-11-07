import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import { IoMdLogOut } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import "../style.css";
import { BASE_URL } from "../socket";

export default function SideChats({ loggedInUsername, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [newChatUsername, setNewChatUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showZoomedPic, setShowZoomedPic] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!loggedInUsername) {
        console.error("No logged in username provided.");
        return;
      }
      try {
        const response = await axios.get(
          `${BASE_URL}/api/users/user/${loggedInUsername}/chats`
        );

        if (
          Array.isArray(response.data.chats) &&
          response.data.chats.length > 0
        ) {
          setUsers(response.data.chats);
          setEmptyMessage("");
        } else {
          setEmptyMessage("No chats yet! Add a new one.");
        }
      } catch (error) {
        console.error("Error fetching chats:", error.message || error);
        setEmptyMessage("Error fetching chats.");
      }
    };

    fetchChats();

    const handleNewUser = (newUser) => {
      if (!users.some((user) => user.username === newUser.username)) {
        setUsers((prevUsers) => [...prevUsers, newUser]);
      }
    };

    const handleReceiveMessage = (data) => {
      const { sender } = data;
      if (sender !== loggedInUsername) {
        setUnreadMessages((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1,
        }));
      }
    };

    socket.on("newUser", handleNewUser);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("newUser", handleNewUser);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [loggedInUsername, users]);

  useEffect(() => {
    const loggedInUserProfilePic = localStorage.getItem("profilePicture");
    setProfilePic(loggedInUserProfilePic);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddChatClick = () => {
    setShowDialog(true);
    setErrorMessage("");
  };

  const handleAddChat = async () => {
    if (!newChatUsername.trim()) {
      setErrorMessage("Username cannot be empty.");
      return;
    }

    try {
      const userExists = users.some(
        (user) => user.username.toLowerCase() === newChatUsername.toLowerCase()
      );

      if (userExists) {
        setErrorMessage("User already exists in your chat list.");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/user/${newChatUsername}`
      );

      if (response.data) {
        await axios.post(
          `${BASE_URL}/api/users/addChat/${loggedInUsername}`,
          { newChatUsername }
        );

        setUsers((prevUsers) => [
          ...prevUsers,
          {
            username: newChatUsername,
            profilePicture: response.data.profilePicture,
          },
        ]);

        setShowDialog(false);
        setNewChatUsername("");
        setErrorMessage("");
      } else {
        setErrorMessage("No user found with that username.");
      }
    } catch (error) {
      setErrorMessage("Error adding user: No user found.");
      console.error("Error finding user:", error.message || error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("profilePicture");
    navigate("/");
  };

  const handleUsernameClick = (username) => {
    setUnreadMessages((prev) => ({
      ...prev,
      [username]: 0,
    }));
    onSelectUser(username);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageClick = () => {
    setShowZoomedPic(true);
  };

  const closeZoomedPic = () => {
    setShowZoomedPic(false);
  };

  return (
    <div className="flex">
      {/* Side Menu for larger screens */}
      <div className="flex flex-col fixed inset-y-0 left-0 bg-gray-900 text-white fixed-sidechats p-5">
        {/* Header section for profile and logout */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                profilePic
                  ? `${BASE_URL}${profilePic}`
                  : "/path/to/default.jpg"
              }
              alt={loggedInUsername}
              className="w-12 h-12 rounded-full object-cover cursor-pointer transition-transform transform hover:scale-110"
              onClick={handleImageClick}
            />
            <h2 className="text-white text-xl">{loggedInUsername}</h2>
          </div>
          <button
            className="bg-green-600 text-white p-2 ml-5 rounded-full hover:bg-green-700 transition"
            onClick={handleAddChatClick}
          >
            <FaPlus />
          </button>
          <button
            className="bg-red-600 text-black p-2 rounded-full hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            <IoMdLogOut />
          </button>
        </div>

        {showZoomedPic && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            onClick={closeZoomedPic}
          >
            <img
              src={`${BASE_URL}${profilePic}`}
              alt="Zoomed Profile"
              className="w-60 h-60 rounded-full object-cover transition-transform transform scale-100 hover:scale-110"
            />
          </div>
        )}

        {showDialog && (
          <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-lg">
              <h3 className="mb-4 text-lg text-black text-center font-semibold">
                Add New Chat
              </h3>
              <input
                type="text"
                className="w-full p-3 rounded-lg mb-2 border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Enter username"
                value={newChatUsername}
                onChange={(e) => setNewChatUsername(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white p-2 rounded-lg w-full hover:bg-blue-700 transition"
                onClick={handleAddChat}
              >
                Add
              </button>
              {errorMessage && (
                <p className="text-red-600 mt-2">{errorMessage}</p>
              )}
              <button
                className="bg-gray-600 text-white p-2 rounded-lg mt-2 w-full hover:bg-gray-700 transition"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          className="w-full p-3 rounded-lg mb-4 bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Search users"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {emptyMessage && <p className="text-yellow-400">{emptyMessage}</p>}
        {filteredUsers.map((user) => (
          <div
            key={user.username}
            className="flex items-center p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition"
            onClick={() => handleUsernameClick(user.username)}
          >
            <img
              src={`${BASE_URL}${user.profilePicture}`}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex justify-between items-center w-full">
              <p className="text-white">{user.username}</p>
              {unreadMessages[user.username] > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2">
                  {unreadMessages[user.username]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
