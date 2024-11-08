import React, { useState, useEffect } from "react";
import SideChats from "./SideChats";
import ChatWindow from "./ChatWindow";
import "../style.css";
import { FaBars } from "react-icons/fa";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [isSideChatsVisible, setIsSideChatsVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setLoggedInUsername(username);
    }

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      if (window.innerWidth >= 1050) {
        setIsSideChatsVisible(true); // Show on larger screens
      } else {
        setIsSideChatsVisible(false); // Hide on smaller screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };

  const toggleSideChats = () => {
    // Toggle side chat visibility
    setIsSideChatsVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen relative">
      {/* SideChats - Hidden on small screens, displayed on larger ones or when toggled */}
      {isSideChatsVisible && (
        <div className="hidden md:block md:w-1/4 sidechats">
          <SideChats
            loggedInUsername={loggedInUsername}
            onSelectUser={handleSelectUser}
          />
        </div>
      )}

      {/* ChatWindow - Takes full width on small screens, and adjusted width on larger screens */}
      <div className={`flex-1 ${isSideChatsVisible ? "md:w-3/4" : "w-full"}`}>
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-center bg-[#000000]/90  text-gray-200">
            <div className="max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold mb-4">
                👋 Welcome to Your Chat!
              </h1>
              <p className="text-gray-400 mb-6">
                Start a conversation by selecting or adding a user from the left
                panel.
              </p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>
                  ➤ Click the <span className="text-green-400">+</span> button
                  to add a new chat
                </li>
                <li>➤ Use the search bar to find existing contacts</li>
                <li>➤ Tap a user to start chatting instantly</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button - Visible only on screens smaller than 1050px */}
      {windowWidth < 1050 && (
        <button
          className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full z-30"
          onClick={toggleSideChats}
        >
          <span className="material-icons">
            <FaBars />
          </span>{" "}
        </button>
      )}

      {/* Slide-In SideChats for mobile */}
      {windowWidth < 1050 && (
        <div
          className={`absolute inset-y-0 left-0 fixed-sidechats bg-gray-800 z-20 transition-transform duration-300 transform ${
            isSideChatsVisible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SideChats
            loggedInUsername={loggedInUsername}
            onSelectUser={handleSelectUser}
          />
        </div>
      )}
    </div>
  );
}
