// src/pages/LoginSignup.tsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // only used in signup
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        alert("Logged in successfully!");
        navigate("/");
      } else {
        await signup(email, password, name);
        alert("Signed up successfully!");
        navigate("/");
      }
    } catch (error: unknown) {
      type ErrorResponse = {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };

      const err = error as ErrorResponse;

      if (
        typeof error === "object" &&
        error !== null &&
        err.response &&
        typeof err.response === "object" &&
        err.response !== null &&
        err.response.data &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "detail" in err.response.data
      ) {
        alert(err.response.data.detail);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Signup"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {isLogin ? "Login" : "Signup"}
        </button>
      </form>
      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button className="text-blue-600" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Signup" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default LoginSignup;
