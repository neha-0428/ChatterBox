import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import logo from "../assets/logo.png";
import bgImage from "../assets/bg.png";
import { BASE_URL } from "../socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email, password }
      );

      toast.success(response.data.message, toastOptions);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("profilePicture", response.data.profilePicture);

      navigate("/avatar");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Login failed, please try again",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-black p-5"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        className="w-full max-w-md p-10 rounded-xl shadow-2xl flex flex-col gap-6 items-center bg-[#000000]/70 text-[#ffffff]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row items-center gap-2">
          <img className="w-16 h-10 invert" src={logo} alt="logo" />
          <span className="font-bold text-3xl">ChatterBox</span>
        </div>
        <input
          className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="w-full relative">
          <input
            className="w-full h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className={`w-full h-12 bg-sky-400 text-white px-4 py-2 rounded-lg border-none shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center text-gray-400">
          Not a user?{" "}
          <Link to="/" className="text-sky-300 hover:underline">
            Register
          </Link>
        </div>
        <div className="text-center text-gray-400">
          <Link to="/forgot-password" className="text-sky-300 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
