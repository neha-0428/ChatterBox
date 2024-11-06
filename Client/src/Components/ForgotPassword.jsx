import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if user exists
      const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email }
      );

      if (response.data) {
        // Fetch the security question
        const questionResponse = await axios.get(
          `http://localhost:5000/api/users/security-question/${email}`
        );

        setSecurityQuestion(questionResponse.data.securityQuestion);
        setIsQuestionVisible(true);
        toast.success("Security question fetched", toastOptions);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred",
        toastOptions
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", toastOptions);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/reset-password",
        { email, password: newPassword, securityAnswer }
      );
      toast.success(response.data.message, toastOptions);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Reset password failed",
        toastOptions
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-black backdrop-blur-sm p-5"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isQuestionVisible ? (
        <form
          className="w-full max-w-md p-8 rounded-lg shadow-lg flex flex-col gap-6 items-center bg-[#000000]/70 text-[#ffffff]"
          onSubmit={handleResetPassword}
        >
          <h2 className="text-3xl font-bold">Reset Password</h2>

          <p className="text-gray-400 mb-4">{securityQuestion}</p>
          <input
            className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            type="text"
            placeholder="Security Answer"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            required
          />
          <div className="w-full relative">
            <input
              className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-4 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="w-full relative">
            <input
              className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-4 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-sky-400 text-white rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Reset Password
          </button>
        </form>
      ) : (
        <form
          className="w-full max-w-md p-8 rounded-lg shadow-lg flex flex-col gap-6 items-center bg-[#000000]/70 text-[#ffffff]"
          onSubmit={handleEmailSubmit}
        >
          <h2 className="text-3xl font-bold">Forgot Password</h2>

          <input
            className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full h-12 bg-sky-400 text-white rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Send Reset Link
          </button>
        </form>
      )}
      <ToastContainer />
    </div>
  );
}
