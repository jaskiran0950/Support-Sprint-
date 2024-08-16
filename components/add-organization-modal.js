import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import styles from "@/styles/contact-submission.module.css";
import toast from "react-hot-toast";

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

export default function AddOrganizationModal({
  isOpen,
  closeModal,
  addNewOrganization,
  updateOrganization,
  editOrganizationData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    Modal.setAppElement();
  }, []);

  useEffect(() => {
    if (editOrganizationData) {
      setFormData(editOrganizationData);
    } else {
      resetFormData();
    }
  }, [editOrganizationData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const url = editOrganizationData
      ? `/api/organization/${editOrganizationData.id}`
      : "/api/organization";

    try {
      const response = await fetch(url, {
        method: editOrganizationData ? "PUT" : "POST",
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
        if (editOrganizationData) {
          updateOrganization(data.data);
          toast.success("Organization updated successfully!");
        } else {
          addNewOrganization(data.data);
          toast.success("New organization added successfully!");
        }
        resetFormData();
        closeModal();
      } else {
        if (data.error === "Email already exists") {
          toast.error("An organization with this email already exists.");
        } else {
          toast.error(
            data.error || "Failed to save organization. Please try again."
          );
        }
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
    if (!formData.phone) {
      newErrors.phone = "This field is required";
    } else if (!phonePattern.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.address) newErrors.address = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
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
      contentLabel="Add Organization Modal"
    >
      <button className={styles.closeButton} onClick={handleCloseModal}>
        X
      </button>
      <h4 className={styles.title}>
        {editOrganizationData ? "Edit Organization" : "Add Organization"}
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
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>
        <div className={styles.enterdataContainer}>
          <label className={styles.label}>Address:</label>
          <textarea
            className={styles.enterdata}
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          {errors.address && (
            <span className={styles.error}>{errors.address}</span>
          )}
        </div>
        <button className={styles.submitButton} type="submit">
          Submit
        </button>
      </form>
    </Modal>
  );
}
