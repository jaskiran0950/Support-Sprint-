import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    try {
      if (!email.trim()) {
        setEmailError("Email can't be blank.");
        return;
      }

      const response = await fetch("/api/forgot-password/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.exists) {
        setOtpSent(true);
        toast.success("OTP sent to your email.");
      } else {
        setEmailError("Account does not exist.");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.verified) {
        setOtpVerified(true);
        toast.success("OTP verified. You can now reset your password.");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch("/api/forgot-password/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successful. You can now log in.");
        router.push("/login");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form
        onSubmit={
          otpVerified
            ? handlePasswordReset
            : otpSent
            ? handleOtpSubmit
            : handleCheckEmail
        }
        className="login-form"
      >
        {!otpVerified && (
          <>
            <div className={`form-group ${emailError ? "error-border" : ""}`}>
              <label className="form-label">Enter Your Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`form-control ${emailError ? "error" : ""}`}
                disabled={otpSent}
              />
              {emailError && <p className="error1">{emailError}</p>}
            </div>

            {otpSent && (
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="form-control"
                />
              </div>
            )}
          </>
        )}

        {otpVerified && (
          <>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="form-control"
              />
              {passwordError && <p className="error1">{passwordError}</p>}
            </div>
          </>
        )}

        <button type="submit" className="s-btn">
          {otpVerified ? "Reset Password" : otpSent ? "Submit OTP" : "Submit"}
        </button>
      </form>
    </div>
  );
}
