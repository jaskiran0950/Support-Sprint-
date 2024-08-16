import React, { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email.trim()) {
        setEmailError("Email can't be blank.");
      }
      if (!password.trim()) {
        setPasswordError("Password can't be blank.");
      }

      if (!email.trim() || !password.trim()) {
        return;
      }

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log(response);

      if (response.ok) {
        router.push("/dashboard");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <div className={`form-group ${emailError ? "error-border" : ""}`}>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`form-control ${emailError ? "error" : ""}`}
          />
          {emailError && <p className="error1">{emailError}</p>}
        </div>
        <div className={`form-group ${passwordError ? "error-border" : ""}`}>
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`form-control ${passwordError ? "error" : ""}`}
          />
          {passwordError && <p className="error1">{passwordError}</p>}
        </div>

        <div className="f-btn">
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="s-btn">
          Login
        </button>
      </form>
    </div>
  );
}
