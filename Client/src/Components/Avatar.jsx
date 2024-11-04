import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.png";

export default function Avatar() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const profilePic = localStorage.getItem("profilePicture");
  const navigate = useNavigate();

  useEffect(() => {
    setUploadedUrl(profilePic);
  }, [profilePic]);

  useEffect(() => {
    if (!userId) {
      alert("UserId not found! Please login again.");
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // Validate image file type
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError("");
      } else {
        setError("Please select a valid image file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/uploadProfilePicture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);
      setUploadedUrl(response.data.profilePicture);
      // Update localStorage
      localStorage.setItem("profilePicture", response.data.profilePicture);
      navigate("/chat");
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleKeepItAsIs = () => {
    navigate("/chat");
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center mb-4 bg-[#000000]/70 text-[#ffffff] p-6 rounded-lg shadow-lg">
        {/* Add instruction text */}
        <p className="text-lg font-semibold mb-4">
          Please select a profile picture
        </p>

        <div className="flex flex-col md:flex-row items-center md:space-x-4">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-40 h-40 rounded-full mb-4 md:mb-0 object-cover"
            />
          ) : uploadedUrl ? (
            <img
              src={`http://localhost:5000${uploadedUrl}`}
              alt="Profile Picture"
              className="w-40 h-40 rounded-full mb-4 md:mb-0 object-cover"
            />
          ) : (
            <div className="w-40 h-40 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 mb-4 md:mb-0">
              No Image
            </div>
          )}
          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 text-white"
            />
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {uploadedUrl && (
              <button
                onClick={handleKeepItAsIs}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Keep as it is
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
