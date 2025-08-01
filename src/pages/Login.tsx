import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

interface LoginResponse {
  accessToken?: string;
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const response = await axiosInstance.post<LoginResponse>("/login", {
        email: email,
        password: password,
      });
      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="h-screen bg-[#FFF9F4] overflow-hidden relative">
      <div className="login-ui-box right-10 -top-40"></div>
      <div className="login-ui-box -bottom-40 right-1/2"></div>
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[90vh] bg-login-bg-img bg-cover bg-center rounded-lg p-10 z-50 flex flex-col justify-end">
          <h4 className="text-5xl font-semibold leading-[58px] mb-2 text-[#212121]">
            Capture your<br /> Memories
          </h4>
          <p className="text-[15px] leading-6 pr-7 text-[#757575]">
            A place to store your memories and share them with your loved ones.
          </p>
        </div>

        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 z-50">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold mb-7 text-[#212121]">Login</h4>
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
              LOGIN
            </button>
            <p className="text-xs text-[#757575] text-center my-4">Or</p>

            <button
              type="button"
              className="btn-primary btn-light bg-[#D1C4E9] hover:bg-[#B39DDB] text-[#7E57C2]"
              onClick={() => navigate("/signup")}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-ui-box {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: #D1C4E9;
          opacity: 0.3;
          filter: blur(50px);
        }
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

export default Login;