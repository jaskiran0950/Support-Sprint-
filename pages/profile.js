import React, { useState, useEffect } from "react";
import styles from "@/styles/profile.module.css";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    organization: "",
    role: "",
  });

  const [resetPasswordFormData, setResetPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("details");

  const [errors, setErrors] = useState({});

  const [tempData, setTempData] = useState({});

  const phonePattern = /^[6-9]\d{9}$/;

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setFormData(data.user);
        setTempData(data.user);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab !== "reset") {
      setResetPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [activeTab]);

  const handleEditClick = () => {
    setIsEditing(true);
    setTempData(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setTempData({ ...tempData, [name]: value });
  };

  const handleSaveClick = async () => {
    const newErrors = {};
    if (!tempData.name) {
      newErrors.name = "This field is required";
    }
    if (!tempData.mobile || !phonePattern.test(tempData.mobile)) {
      newErrors.mobile = "Invalid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: tempData.name,
        mobile: tempData.mobile,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setFormData(tempData);
      setIsEditing(false);
      toast.success("Your Information has been updated.");
    } else {
      console.error(data.message);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setErrors({});
    setTempData(formData);
  };

  const handleResetPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setResetPasswordFormData({ ...resetPasswordFormData, [name]: value });
  };

  const handleResetPasswordClick = async () => {
    const newErrors = {};

    if (!resetPasswordFormData.oldPassword) {
      newErrors.oldPassword = "This field is required";
    }
    if (!resetPasswordFormData.newPassword) {
      newErrors.newPassword = "This field is required";
    }
    if (
      !resetPasswordFormData.confirmPassword ||
      resetPasswordFormData.confirmPassword !==
        resetPasswordFormData.newPassword
    ) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = await fetch("/api/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetPasswordFormData),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Password reset successful.");
      setResetPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(data.message || "Password reset failed.");
    }
  };

  const handleResetPasswordCancelClick = () => {
    setResetPasswordFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "details" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("details")}
        >
          View Details
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "reset" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("reset")}
        >
          Reset Password
        </button>
      </div>

      <div className={styles.profileForm}>
        {activeTab === "details" && (
          <>
            {!isEditing && (
              <FaEdit className={styles.editIcon} onClick={handleEditClick} />
            )}
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={tempData.name}
                  onChange={handleInputChange}
                  className={styles.profileInput}
                />
              ) : (
                <span className={styles.profileValue}>{formData.name}</span>
              )}
              {errors.name && (
                <span className={styles.error}>{errors.name}</span>
              )}
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Email:</label>
              <span className={styles.profileValue}>{formData.email}</span>
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Mobile:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="mobile"
                  value={tempData.mobile}
                  onChange={handleInputChange}
                  className={styles.profileInput}
                />
              ) : (
                <span className={styles.profileValue}>{formData.mobile}</span>
              )}
              {errors.mobile && (
                <span className={styles.error}>{errors.mobile}</span>
              )}
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Organization:</label>
              <span className={styles.profileValue}>
                {formData.organization.name}
              </span>
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Role:</label>
              <span className={styles.profileValue}>{formData.role}</span>
            </div>
            {isEditing && (
              <div className={styles.buttonContainer}>
                <button className={styles.saveButton} onClick={handleSaveClick}>
                  Save Changes
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "reset" && (
          <>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Old Password:</label>
              <input
                type="password"
                name="oldPassword"
                value={resetPasswordFormData.oldPassword}
                onChange={handleResetPasswordInputChange}
                className={styles.profileInput}
              />
              {errors.oldPassword && (
                <span className={styles.error}>{errors.oldPassword}</span>
              )}
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={resetPasswordFormData.newPassword}
                onChange={handleResetPasswordInputChange}
                className={styles.profileInput}
              />
              {errors.newPassword && (
                <span className={styles.error}>{errors.newPassword}</span>
              )}
            </div>
            <div className={styles.profileItem}>
              <label className={styles.profileLabel}>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={resetPasswordFormData.confirmPassword}
                onChange={handleResetPasswordInputChange}
                className={styles.profileInput}
              />
              {errors.confirmPassword && (
                <span className={styles.error}>{errors.confirmPassword}</span>
              )}
            </div>
            <div className={styles.buttonContainer}>
              <button
                className={styles.saveButton}
                onClick={handleResetPasswordClick}
              >
                Reset Password
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleResetPasswordCancelClick}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

export default ProfilePage;
