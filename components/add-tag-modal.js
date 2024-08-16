import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import styles from "@/styles/contact-submission.module.css";
import toast from "react-hot-toast";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    width: "40%",
    right: "auto",
    bottom: "auto",
    marginRight: "-35%",
    transform: "translate(-50%, -50%)",
  },
};

export default function AddTagModal({
  isOpen,
  closeModal,
  addNewTag,
  updateTag,
  editTagData,
}) {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    Modal.setAppElement();
  }, []);

  useEffect(() => {
    if (editTagData) {
      setFormData(editTagData);
    } else {
      resetFormData();
    }
  }, [editTagData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const url = editTagData ? `/api/tags/${editTagData.id}` : "/api/tags";

    try {
      const response = await fetch(url, {
        method: editTagData ? "PUT" : "POST",
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
        if (editTagData) {
          updateTag(data.data);
          toast.success("Tag updated successfully!");
        } else {
          addNewTag(data.data);
          toast.success("New tag added successfully!");
        }
        resetFormData();
        closeModal();
      } else {
        toast.error(data.error || "Failed to save tag. Please try again.");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      toast.error(error.message);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    setFormData({
      name: "",
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
      contentLabel="Add Tag Modal"
    >
      <button className={styles.closeButton} onClick={handleCloseModal}>
        X
      </button>
      <p>
        <h4 className={styles.title}>{editTagData ? "Edit Tag" : "Add Tag"}</h4>
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.enterdataC}>
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
        <p>
          <button className={styles.submitButton} type="submit">
            Submit
          </button>
        </p>
      </form>
    </Modal>
  );
}
