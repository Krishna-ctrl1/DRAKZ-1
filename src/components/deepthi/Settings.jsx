import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config/backend";
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import "../../styles/deepthi/settings.css";
import axios from "../../api/axios.api";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    role: "",
    profilePicture: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Financial state
  const [financialData, setFinancialData] = useState({
    currency: "INR",
    riskProfile: "Moderate",
    monthlyIncome: 0,
  });
  const [financialErrors, setFinancialErrors] = useState({});

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/settings/profile");
      const data = response.data;

      setProfileData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        occupation: data.occupation || "",
        role: data.role || "",
        profilePicture: data.profilePicture || "",
      });

      // Set profile picture preview if exists
      if (data.profilePicture) {
        setProfilePicturePreview(`${BACKEND_URL}${data.profilePicture}`);
      }

      setFinancialData({
        currency: data.currency || "INR",
        riskProfile: data.riskProfile || "Moderate",
        monthlyIncome: data.monthlyIncome || 0,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 404) {
        setMessage({ type: "error", text: "Session invalid. Please log in again." });
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage({ type: "error", text: "Failed to load settings" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    // client-side validation before sending
    console.log("Validating profile data:", profileData);
    const errs = validateProfile(profileData);
    console.log("Validation errors:", errs);
    setProfileErrors(errs);

    if (Object.keys(errs).length > 0) {
      console.log("Validation failed, stopping save.");
      setMessage({ type: "error", text: "Please fix validation errors" });
      return;
    }
    console.log("Validation passed, proceeding to save.");
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await axios.put("/api/settings/profile", {
        name: profileData.name,
        phone: profileData.phone,
        occupation: profileData.occupation,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };
  const validateProfile = (data) => {
    const errors = {};
    const newData = { ...data };

    // --- Name Validation ---
    const name = (data.name || "").trim();
    if (!name) {
      errors.name = "Name is required";
      newData.name = "";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters";
      newData.name = "";
    } else if (name.length > 100) {
      errors.name = "Name must be under 100 characters";
      newData.name = "";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = "Name can only contain letters and spaces";
      newData.name = "";
    }

    // --- Phone Validation ---
    const phoneRaw = (data.phone || "").toString().trim();
    if (phoneRaw) {
      if (!/^[0-9+\-\s()]+$/.test(phoneRaw)) {
        errors.phone = "Phone number contains invalid characters";
        newData.phone = "";
      } else {
        const digits = phoneRaw.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) {
          errors.phone = "Enter a valid phone number (10–15 digits)";
          newData.phone = "";
        }
      }
    }

    // --- Occupation Validation ---
    if (data.occupation) {
      if (/\d/.test(data.occupation)) {
        errors.occupation = "Occupation cannot contain numbers";
        newData.occupation = "";
      } else if (!/^[a-zA-Z\s]+$/.test(data.occupation)) {
        errors.occupation = "Occupation can only contain letters and spaces";
        newData.occupation = "";
      }
    }

    // Update data after clearing incorrect fields
    setProfileData(newData);

    return errors;
  };

  const validateFinancial = (data) => {
    const errors = {};
    if (
      data.monthlyIncome === undefined ||
      data.monthlyIncome === null ||
      isNaN(data.monthlyIncome)
    ) {
      errors.monthlyIncome = "Please enter a valid income amount";
    } else if (data.monthlyIncome < 0) {
      errors.monthlyIncome = "Income cannot be negative";
    }
    return errors;
  };

  const validatePassword = (data) => {
    const errors = {};
    if (!data.newPassword) {
      errors.newPassword = "New password is required";
    } else {
      if (data.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(data.newPassword)) {
        errors.newPassword =
          "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(data.newPassword)) {
        errors.newPassword = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(data.newPassword)) {
        errors.newPassword =
          "Password must contain at least one special character";
      }
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleFinancialSave = async () => {
    const errs = validateFinancial(financialData);
    setFinancialErrors(errs);
    if (Object.keys(errs).length > 0) {
      setMessage({ type: "error", text: "Please fix validation errors" });
      return;
    }
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await axios.put("/api/settings/financial", financialData);

      setMessage({ type: "success", text: "Financial preferences updated!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to update preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const errs = validatePassword(passwordData);
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) {
      setMessage({ type: "error", text: "Please fix validation errors" });
      return;
    }
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await axios.put("/api/settings/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: "error", text: "Only image files are allowed (JPEG, PNG, GIF, WEBP)" });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }

      setProfilePictureFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) {
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    try {
      setUploadingPicture(true);
      setMessage({ type: "", text: "" });

      const formData = new FormData();
      formData.append("profilePicture", profilePictureFile);

      const response = await axios.post("/api/settings/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedProfilePicture = response.data.profilePicture;

      console.log('📸 Settings: Received profilePicture from server:', updatedProfilePicture);

      setProfileData({
        ...profileData,
        profilePicture: updatedProfilePicture,
      });

      // Update localStorage to persist the change
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('📦 Settings: Current user in localStorage:', user);
          user.profilePicture = updatedProfilePicture;
          localStorage.setItem("user", JSON.stringify(user));
          console.log('✅ Settings: Updated user in localStorage:', JSON.parse(localStorage.getItem('user')));

          // Update Header directly
          if (window.updateHeaderProfilePicture) {
            window.updateHeaderProfilePicture(updatedProfilePicture);
            console.log('📡 Settings: Called updateHeaderProfilePicture');
          }

          // Also dispatch event as fallback
          const event = new CustomEvent("profilePictureUpdated", {
            detail: { profilePicture: updatedProfilePicture }
          });
          window.dispatchEvent(event);
          console.log('📡 Settings: Dispatched profilePictureUpdated event');
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }

      setMessage({ type: "success", text: "Profile picture updated successfully!" });
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.msg || "Failed to upload profile picture",
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <div className="app">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <div
            className={collapsed ? "main-content-collapsed" : "main-content"}
          >
            <div className="settings-loading">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="settings-container">
            <h1 className="settings-title">Settings</h1>

            {/* Message Banner */}
            {message.text && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Tabs */}
            <div className="settings-tabs">
              <button
                className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fa-solid fa-user"></i> Profile
              </button>
              <button
                className={`settings-tab ${activeTab === "financial" ? "active" : ""}`}
                onClick={() => setActiveTab("financial")}
              >
                <i className="fa-solid fa-chart-line"></i> Financial
              </button>
              <button
                className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <i className="fa-solid fa-lock"></i> Security
              </button>
            </div>

            {/* Tab Content */}
            <div className="settings-content">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="settings-section">
                  <h2>Profile Information</h2>
                  <div className="settings-form">
                    {/* Profile Picture Section */}
                    <div className="form-group profile-picture-section">
                      <label>Profile Picture</label>
                      <div className="profile-picture-container">
                        <div className="profile-picture-preview">
                          {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Profile" />
                          ) : (
                            <div className="profile-picture-placeholder">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="profile-picture-controls">
                          <input
                            type="file"
                            id="profilePictureInput"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleProfilePictureChange}
                            style={{ display: "none" }}
                          />
                          <label htmlFor="profilePictureInput" className="profile-picture-select-btn">
                            <i className="fa-solid fa-camera"></i> Choose Photo
                          </label>
                          {profilePictureFile && (
                            <button
                              className="profile-picture-upload-btn"
                              onClick={handleProfilePictureUpload}
                              disabled={uploadingPicture}
                            >
                              {uploadingPicture ? "Uploading..." : "Upload Photo"}
                            </button>
                          )}
                        </div>
                      </div>
                      <small>Supported formats: JPEG, PNG, GIF, WEBP (Max 5MB)</small>
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => {
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          });
                          setProfileErrors((p) => ({ ...p, name: undefined }));
                        }}
                        placeholder="Enter your full name"
                      />
                      {profileErrors.name && (
                        <div className="field-error">{profileErrors.name}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="disabled-input"
                      />
                      <small>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                          console.log("Phone changed to:", e.target.value);
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          });
                          setProfileErrors((p) => ({ ...p, phone: undefined }));
                        }}
                        placeholder="+91 XXXXXXXXXX"
                      />
                      {profileErrors.phone && (
                        <div className="field-error">{profileErrors.phone}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={profileData.occupation}
                        onChange={(e) => {
                          setProfileData({
                            ...profileData,
                            occupation: e.target.value,
                          });
                          setProfileErrors((p) => ({
                            ...p,
                            occupation: undefined,
                          }));
                        }}
                        placeholder="e.g., Software Engineer"
                      />
                      {profileErrors.occupation && (
                        <div className="field-error">
                          {profileErrors.occupation}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Account Type</label>
                      <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className="disabled-input"
                      />
                      <small>Contact admin to change account type</small>
                    </div>

                    <button
                      className="settings-save-btn"
                      onClick={handleProfileSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Preferences */}
              {activeTab === "financial" && (
                <div className="settings-section">
                  <h2>Financial Preferences</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={financialData.currency}
                        onChange={(e) =>
                          setFinancialData({
                            ...financialData,
                            currency: e.target.value,
                          })
                        }
                      >
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                        <option value="GBP">£ British Pound (GBP)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Risk Profile</label>
                      <select
                        value={financialData.riskProfile}
                        onChange={(e) =>
                          setFinancialData({
                            ...financialData,
                            riskProfile: e.target.value,
                          })
                        }
                      >
                        <option value="Conservative">
                          Conservative - Low Risk, Stable Returns
                        </option>
                        <option value="Moderate">
                          Moderate - Balanced Risk & Returns
                        </option>
                        <option value="Aggressive">
                          Aggressive - High Risk, High Returns
                        </option>
                      </select>
                      <small>
                        This helps tailor investment recommendations
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={financialData.monthlyIncome}
                        onChange={(e) => {
                          setFinancialData({
                            ...financialData,
                            monthlyIncome: Number(e.target.value),
                          });
                          setFinancialErrors((p) => ({
                            ...p,
                            monthlyIncome: undefined,
                          }));
                        }}
                        placeholder="Enter your monthly income"
                        min="0"
                      />
                      {financialErrors.monthlyIncome && (
                        <div className="field-error">
                          {financialErrors.monthlyIncome}
                        </div>
                      )}
                      <small>
                        Used for budget planning and recommendations
                      </small>
                    </div>

                    <button
                      className="settings-save-btn"
                      onClick={handleFinancialSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="settings-section">
                  <h2>Change Password</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          });
                          setPasswordErrors((p) => ({
                            ...p,
                            newPassword: undefined,
                          }));
                        }}
                        placeholder="Enter new password (min 8 characters)"
                      />
                      {passwordErrors.newPassword && (
                        <div className="field-error">
                          {passwordErrors.newPassword}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          });
                          setPasswordErrors((p) => ({
                            ...p,
                            confirmPassword: undefined,
                          }));
                        }}
                        placeholder="Re-enter new password"
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="field-error">
                          {passwordErrors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <button
                      className="settings-save-btn"
                      onClick={handlePasswordChange}
                      disabled={saving}
                    >
                      {saving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
