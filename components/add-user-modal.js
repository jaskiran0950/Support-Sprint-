import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import toast from "react-hot-toast";
import styles from "@/styles/contact-submission.module.css";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    width: "60%",
    right: "auto",
    bottom: "auto",
    marginRight: "-35%",
    transform: "translate(-50%, -50%)",
  },
};

const phonePattern = /^[6-9]\d{9}$/;

export default function AddUserModal({
  isOpen,
  closeModal,
  addNewUser,
  updateUser,
  editUserData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    Modal.setAppElement();
  }, []);

  useEffect(() => {
    if (editUserData) {
      setFormData(editUserData);
    } else {
      resetFormData();
    }
  }, [editUserData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const url = editUserData ? `/api/user/${editUserData.id}` : "/api/user";

    try {
      const response = await fetch(url, {
        method: editUserData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Network response was not ok");
      }

      if (data.success) {
        if (editUserData) {
          updateUser(data.data);
          toast.success("User updated successfully!");
        } else {
          addNewUser(data.data);
          toast.success("New user added successfully!");
        }
        resetFormData();
        closeModal();
      } else {
        toast.error(data.error || "Failed to save user. Please try again.");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      toast.error(error.message);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "This field is required";
    if (!formData.email) newErrors.email = "This field is required";
    if (!formData.mobile) {
      newErrors.mobile = "This field is required";
    } else if (!phonePattern.test(formData.mobile)) {
      newErrors.mobile = "Invalid phone number";
    }
    if (!formData.role) newErrors.role = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      role: "",
    });
    setErrors({});
  };

  const handleCloseModal = () => {
    resetFormData();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      style={customStyles}
      contentLabel="Add User Modal"
    >
      <button className={styles.closeButton} onClick={handleCloseModal}>
        X
      </button>
      <h4 className={styles.title}>
        {editUserData ? "Edit User" : "Add User"}
      </h4>
      <form onSubmit={handleSubmit}>
        <div className={styles.enterdataContainer}>
          <label className={styles.label}>Name:</label>
          <input
            className={styles.enterdata}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        <div className={styles.enterdataContainer}>
          <label className={styles.label}>Email:</label>
          <input
            className={styles.enterdata}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={styles.enterdataContainer}>
          <label className={styles.label}>Phone No:</label>
          <input
            className={styles.enterdata}
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          {errors.mobile && (
            <span className={styles.error}>{errors.mobile}</span>
          )}
        </div>
        <div className={styles.enterdataContainer}>
          <label className={styles.label}>Role:</label>
          <select
            className={styles.enterdata}
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="User">End User</option>
            <option value="Support">Support</option>
          </select>
          {errors.role && <span className={styles.error}>{errors.role}</span>}
        </div>

        <button className={styles.submitButton} type="submit">
          Submit
        </button>
      </form>
    </Modal>
  );
}
