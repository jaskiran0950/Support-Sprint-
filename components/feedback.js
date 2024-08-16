import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";

const FeedbackForm = ({ onSubmit, onClose }) => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }
    setError("");
    onSubmit({ message, rating });
  };

  const handleRating = (rate) => {
    setRating(rate);
    setError(""); // Clear error when a rating is given
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3 style={headerStyle}>Feedback Form</h3>
        <div style={ratingContainerStyle}>
          <Rating onClick={handleRating} ratingValue={rating} />
        </div>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your feedback"
            style={textareaStyle}
          />
          <div style={buttonContainerStyle}>
            <button type="submit" style={submitButtonStyle}>
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  width: "600px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const headerStyle = {
  marginBottom: "20px",
  textAlign: "center",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
};

const textareaStyle = {
  width: "100%",
  height: "100px",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const ratingContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "10px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
};

const submitButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const errorStyle = {
  color: "red",
  textAlign: "center",
  marginBottom: "10px",
};
export default FeedbackForm;
