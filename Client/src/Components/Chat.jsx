import React, { useState, useEffect } from "react";
import SideChats from "./SideChats";
import ChatWindow from "./ChatWindow";
import bgImage from "../assets/bg.png";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setLoggedInUsername(username);
    }
  }, []);

  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };

  return (
    <div className="flex h-screen">
      {/* SideChats takes 25% of the screen on larger screens and hides on smaller screens */}
      <div className="hidden md:block md:w-1/4">
        <SideChats
          loggedInUsername={loggedInUsername}
          onSelectUser={handleSelectUser}
        />
      </div>

      {/* ChatWindow takes 75% of the screen on larger screens, full width on smaller screens */}
      <div className="w-full md:w-3/4">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-2xl bg-[#000000]/90">
            Please select a user to chat
          </div>
        )}
      </div>
    </div>
  );
}
