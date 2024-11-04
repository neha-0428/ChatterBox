import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";
import axios from "axios";
import bgImage from "../assets/bg.png";

export default function Register() {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const securityQuestions = [
    "What is your father's name?",
    "What is your mother's maiden name?",
    "What is the name of your favorite teacher?",
    "What is your favourite movie?",
    "What is your favorite food?",
    "In which city were you born?",
    "What is your favorite actor?",
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!handleValidations()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        values
      );
      toast.success(response.data.message, toastOptions);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Registration failed",
        toastOptions
      );
      console.error("Registration Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
  };

  const handleValidations = () => {
    const {
      username,
      password,
      confirmPassword,
      securityQuestion,
      securityAnswer,
    } = values;

    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match", toastOptions);
      return false;
    } else if (username.length <= 3) {
      toast.error("Username must be greater than 3 characters", toastOptions);
      return false;
    } else if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter",
        toastOptions
      );
      return false;
    } else if (!/[a-z]/.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter",
        toastOptions
      );
      return false;
    } else if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one digit", toastOptions);
      return false;
    } else if (!/[!@#$%^&*]/.test(password)) {
      toast.error(
        "Password must contain at least one special character",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error("Password must have at least 8 characters", toastOptions);
      return false;
    } else if (!securityQuestion) {
      toast.error("Please select a security question", toastOptions);
      return false;
    } else if (!securityAnswer) {
      toast.error("Please provide a security answer", toastOptions);
      return false;
    }

    return true;
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <form
        className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-4 sm:gap-6 items-center bg-[#000000]/70 text-white"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row items-center gap-2">
          <img
            className="w-12 h-8 sm:w-16 sm:h-10 invert"
            src={logo}
            alt="logo"
          />
          <span className="font-bold text-2xl sm:text-3xl">ChatterBox</span>
        </div>
        <input
          className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          type="text"
          name="username"
          placeholder="Username"
          value={values.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          type="email"
          name="email"
          placeholder="Email"
          value={values.email}
          onChange={handleChange}
          required
        />

        {/* Password Input */}
        <div className="w-full relative">
          <input
            className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-gray-400"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="w-full relative">
          <input
            className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={values.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-gray-400"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Dropdown for Security Questions */}
        <select
          className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          name="securityQuestion"
          value={values.securityQuestion}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select a Security Question
          </option>
          {securityQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </select>

        <input
          className="w-full h-10 sm:h-12 bg-gray-700 text-white px-4 rounded-lg border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          type="text"
          name="securityAnswer"
          placeholder="Security Answer"
          value={values.securityAnswer}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className={`w-full h-10 sm:h-12 bg-sky-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <div className="text-center text-gray-400 text-sm sm:text-base">
          Already a user?{" "}
          <Link to="/login" className="text-sky-300 hover:underline">
            Login
          </Link>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
