import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

interface SignupResponse {
  accessToken?: string;
  message?: string;
}

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    setError("");
  
    try {
      const response = await axiosInstance.post<SignupResponse>("/create-account", {
        fullName: name,
        email: email,
        password: password,
      });
  
      console.log("Signup Response:", response.data);

      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      } else {
        setError("Signup failed. Please try again.");
        console.error("Response does not contain accessToken:", response.data);
      }
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error);
      setError(error.response?.data?.message || "Something went wrong. Please try again later.");
    }
  };
  
  return (
    <div className="h-screen bg-[#FFF9F4] overflow-hidden relative">
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        
        {/* Left Side (Image & Text) */}
        <div className="w-2/4 h-[90vh] bg-signup-bg-img bg-cover bg-center rounded-lg p-10 z-50 flex flex-col justify-end">
          <h4 className="text-5xl text-[#212121] font-semibold leading-[58px] mb-2">
            Join & Store Memories
          </h4>
          <p className="text-[15px] text-[#757575] leading-6 pr-7">
            Create an account to start storing your memories and share them with your loved ones.
          </p>
        </div>

        {/* Right Side (Signup Form) */}
        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 z-50">
          <form onSubmit={handleSignup}>
            <h4 className="text-2xl font-semibold mb-7 text-[#212121]">SignUp</h4>

            <input 
              type="text" 
              placeholder="Full Name" 
              className="input-box"
              value={name}
              onChange={({ target }) => setName(target.value)}
            />

            <input 
              type="text" 
              placeholder="Email" 
              className="input-box"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />

            <PasswordInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button 
              type="submit" 
              className="btn-primary bg-[#B39DDB] hover:bg-[#D1C4E9] text-[#7E57C2]"
            >
              SIGNUP
            </button>

            <p className="text-xs text-[#757575] text-center my-4">Or</p>

            <button
              type="button"
              className="btn-primary btn-light bg-[#D1C4E9] hover:bg-[#B39DDB] text-[#7E57C2]"
              onClick={() => navigate("/login")}
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-box {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 20px;
          border: 1px solid #B39DDB;
          border-radius: 8px;
          background: #FFF9F4;
          color: #212121;
        }
        .btn-primary {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-light {
          background: #D1C4E9;
        }
      `}</style>
    </div>
  );
};

export default Signup;