import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import bgImage from "../assets/bg6.jpg";
import { BASE_URL } from "../socket";

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [selectedUserPic, setSelectedUserPic] = useState("");
  const [showZoomedPic, setShowZoomedPic] = useState(false);
  const chatWindowRef = useRef(null); 

  // Effect to initialize socket connection and fetch messages/user pic
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setLoggedInUsername(username);
      socket.emit("join", username);
    }

    // Handle incoming messages from the socket
    const handleReceiveMessage = ({ sender, text, timestamp }) => {
      const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (sender === selectedUser || sender === loggedInUsername) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender, text, timestamp: formattedTimestamp },
        ]);
      }
      // Scroll to bottom when new message is received
      scrollToBottom();
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser, loggedInUsername]);

  // Scroll to the bottom of the chat window when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to fetch messages and user profile picture
  useEffect(() => {
    async function fetchMessagesAndUserPic() {
      if (selectedUser && loggedInUsername) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/chats/${loggedInUsername}/${selectedUser}`
          );
          const formattedMessages = response.data.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(formattedMessages);

          const userResponse = await axios.get(
            `${BASE_URL}/api/users/user/${selectedUser}`
          );
          setSelectedUserPic(userResponse.data.profilePicture);
        } catch (error) {
          console.error(
            "Error fetching messages or user pic:",
            error.message || error
          );
        }
      }
    }

    fetchMessagesAndUserPic();
  }, [selectedUser, loggedInUsername]);

  // Function to send a new message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const timestamp = new Date().toISOString(); 
      try {
        socket.emit("sendMessage", {
          sender: loggedInUsername,
          receiver: selectedUser,
          text: newMessage,
          timestamp,
        });

        // Update local state after emitting
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: loggedInUsername,
            text: newMessage,
            timestamp: new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        setNewMessage("");

        scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error.message || error);
      }
    }
  };

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  // Function to handle image click for zoom
  const handleImageClick = () => {
    setShowZoomedPic(true);
  };

  // Function to close the zoomed image
  const closeZoomedPic = () => {
    setShowZoomedPic(false);
  };

  return (
    <div
      className={`w-full h-screen ${
        selectedUser ? "bg-gray-950" : "bg-red-800"
      } p-5 flex flex-col`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* User's profile and name */}
      <div className="flex items-center space-x-4 mb-2">
        {selectedUserPic ? (
          <img
            src={`${BASE_URL}${selectedUserPic}`}
            alt={selectedUser}
            className="w-16 h-16 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={handleImageClick}
          />
        ) : (
          <span>No profile picture</span>
        )}
        <span className="text-white text-2xl">{selectedUser}</span>
      </div>

      {/* Chat messages */}
      <div
        ref={chatWindowRef}
        className="flex-grow overflow-y-auto bg-[#000000]/70 p-2 rounded-lg"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === loggedInUsername
                ? "justify-end"
                : "justify-start"
            } mb-3`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                message.sender === loggedInUsername
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input field and Send button */}
      <div className="mt-2 flex items-center">
        <input
          type="text"
          className="flex-grow p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>

      {/* Zoomed profile picture */}
      {showZoomedPic && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
          onClick={closeZoomedPic}
        >
          <img
            src={`${BASE_URL}${selectedUserPic}`}
            alt="Zoomed Profile"
            className="w-60 h-60 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
