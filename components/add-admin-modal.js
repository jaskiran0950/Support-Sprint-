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

export default function AddAdminModal({
  isOpen,
  closeModal,
  addNewAdmin,
  updateAdmin,
  editAdminData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    organization_id: "",
  });

  const [errors, setErrors] = useState({});
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    Modal.setAppElement();
  }, []);

  useEffect(() => {
    if (editAdminData) {
      setFormData(editAdminData);
    } else {
      resetFormData();
    }
  }, [editAdminData]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organization");
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.data);
        } else {
          console.error("Error fetching organizations:", data.error);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const url = editAdminData ? `/api/admin/${editAdminData.id}` : "/api/admin";

    try {
      const response = await fetch(url, {
        method: editAdminData ? "PUT" : "POST",
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
        if (editAdminData) {
          updateAdmin(data.data);
          toast.success("Admin updated successfully!");
        } else {
          addNewAdmin(data.data);
          toast.success("New admin added successfully!");
        }
        resetFormData();
        closeModal();
      } else {
        toast.error(data.error || "Failed to save admin. Please try again.");
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
    if (!formData.organization_id)
      newErrors.organization_id = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      organization_id: "",
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
      contentLabel="Add Admin Modal"
    >
      <button className={styles.closeButton} onClick={handleCloseModal}>
        X
      </button>
      <h4 className={styles.title}>
        {editAdminData ? "Edit Admin" : "Add Admin"}
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
          <label className={styles.label}>Organization:</label>
          <select
            className={styles.enterdata}
            name="organization_id"
            value={formData.organization_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select an organization
            </option>
            {organizations.map((org) => (
              <option key={org.name} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {errors.organization_id && (
            <span className={styles.error}>{errors.organization_id}</span>
          )}
        </div>

        <button className={styles.submitButton} type="submit">
          Submit
        </button>
      </form>
    </Modal>
  );
}
