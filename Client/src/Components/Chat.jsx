import React, { useState, useEffect } from "react";
import SideChats from "./SideChats";
import ChatWindow from "./ChatWindow";
import bgImage from "../assets/bg.png";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    console.log(username);
    if (username) {
      setLoggedInUsername(username);
    }
  }, []);

  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };

  return (
    <div className="flex h-screen">
      <SideChats
        loggedInUsername={loggedInUsername}
        onSelectUser={handleSelectUser}
      />
      <div className="flex-1">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div
            className="flex items-center justify-center h-full text-white text-2xl bg-[#000000]/90"
          >
            Please select a user to chat
          </div>
        )}
      </div>
    </div>
  );
}
