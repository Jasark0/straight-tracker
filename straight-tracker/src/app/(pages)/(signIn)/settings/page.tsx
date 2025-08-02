"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { changeNickname, changePassword, changeUsername, getUserSession, updateAvatarInProfile, updateProfile } from '@/actions/auth';
import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Settings.css" // Make sure settings styles are imported
import { Edit } from "lucide-react"; // Import Edit icon
import { forgotPassword } from '@/actions/auth'; // Import forgotPassword action
import Avatar from './avatar';
// No longer importing Settings component

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeNicknameModal, setShowChangeNicknameModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [avatar_url, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession();
      setUser(session?.user);

      setLoading(false);

      if (session?.user) {
        try {
          const profileResult = await updateProfile();
          if ( profileResult.status !== "success") {
            console.warn("Profile sync warning:", profileResult.status);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    };
    fetchUser();
  }, []);

  const handleEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Security Check: Ensure the entered email matches the logged-in user's email
    if (user && resetEmail.toLowerCase() !== user.email.toLowerCase()) {
      setError("The email provided does not match your account's email.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', resetEmail);

    const result = await changePassword(formData);

    if (result.status === "success") {
      setShowChangePasswordModal(false);
      alert("Password reset email sent! Please check your inbox.");
    } else {
      setError(result.status);
    }
    setLoading(false);
  };

  const handleChangeNickname = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!newNickname || newNickname.trim() === "") {
      setError("Nickname cannot be empty.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nickname', newNickname);

    const result = await changeNickname(formData);

    if (result.status === "success") {
      setShowChangeNicknameModal(false);
      alert("Nickname updated successfully!");
      const session = await getUserSession();
      setUser(session?.user);
    } else {
      setError(result.status);
    }
    setLoading(false);
  };

    const handleChangeUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!newUsername || newUsername.trim() === "") {
      setError("Username cannot be empty.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('username', newUsername);

    const result = await changeUsername(formData);

    if (result.status === "success") {
      setShowChangeUsernameModal(false);
      alert("Username updated successfully!");
      const session = await getUserSession();
      setUser(session?.user);
    } else {
      setError(result.status);
    }
    setLoading(false);
  };

  const censorEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const censoredLocalPart = localPart.length > 2 ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] : localPart;
    return `${censoredLocalPart}@${domain}`;
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  const nickname = user?.user_metadata?.nickname;
  const username = user?.user_metadata?.username;
  const email = user?.email || "No Email";
  const profileImage = user?.user_metadata?.avatar_url;

  return (
    <div className="settings-page-box">
      <div className={`settings-container ${showChangePasswordModal ? "blurred" : ""}`}>
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your account information and preferences
          </p>
        </div>

        <div className="settings-content">
          <div className="settings-profileSection">
            <div className="settings-profileImage">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="settings-profileImageInner"
                />
              ) : null}
            </div>
            <div className="settings-profileControls">
              <Avatar
                uid={user?.id ?? null}
                url={avatar_url}
                size={150}
                onUpload={async (url: string) => {
                  setAvatarUrl(url);

                  const result = await updateAvatarInProfile({ avatar_url: url });

                  if (result.status === "success") {
                    alert("Avatar updated successfully!");
                  } else {
                    alert("Error updating avatar: " + result.status);
                  }
                }}
              />
            </div>
          </div>

          <div className="settings-infoSection">
            <h2 className="settings-infoTitle">Account Info</h2>

            <div className="settings-fields">
              <div className="settings-fieldRow">
                <div className="settings-fieldContent">
                  <span className="settings-fieldLabel">Nickname: </span>
                  <span className="settings-fieldValue">{nickname}</span>
                </div>
                <button className="settings-editButton" onClick={() => setShowChangeNicknameModal(true)}>
                  <Edit className="settings-editIcon" />
                </button>
              </div>

              <div className="settings-fieldRow">
                <div className="settings-fieldContent">
                  <span className="settings-fieldLabel">Username: </span>
                  <span className="settings-fieldValue">{username}</span>
                </div>
                <button className="settings-editButton" onClick={() => setShowChangeUsernameModal(true)}>
                  <Edit className="settings-editIcon" />
                </button>
              </div>

              <div className="settings-fieldRow">
                <div className="settings-fieldContent">
                  <span className="settings-fieldLabel">Email: </span>
                  <span className="settings-fieldValue">{censorEmail(email)}</span>
                </div>
                {/* <button className="settings-editButton" onClick={() => setShowChangeEmailModal(true)}>
                  <Edit className="settings-editIcon" />
                </button> */}
              </div>

              <div className="settings-fieldRow">
                <div className="settings-fieldContent">
                  <span className="settings-fieldLabel">Password: </span>
                  <span className="settings-fieldValue">*********</span>
                </div>
                <button className="settings-editButton" onClick={() => setShowChangePasswordModal(true)}>
                  <Edit className="settings-editIcon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChangeUsernameModal && (
        <div className="modal-overlay" onClick={() => setShowChangeUsernameModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={() => setShowChangeUsernameModal(false)}>
                <span>&times;</span> {/* A simple 'x' for the close icon */}
              </button>
              <h4 className="modal-title">Change Username</h4>
            </div>
            <form onSubmit={handleChangeUsername}>
              <div className="settings-modal-body">
                <input
                  type="text"
                  placeholder="Enter new username"
                  maxLength={20}
                  className="settingsTextInput"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <div className="change-display-name-feedback-container">
                  <span className="count-down">{newUsername.length}/20</span>
                </div>

              </div>
              <div className="settings-modal-footer">
                <button type="submit" className="settings-btn">Save</button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      )}


      {showChangeEmailModal && (
        <div className="modal-overlay" onClick={() => setShowChangeEmailModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={() => setShowChangeEmailModal(false)}>
                <span>&times;</span> {/* A simple 'x' for the close icon */}
              </button>
              <h4 className="modal-title">Change Email</h4>
            </div>
            <form onSubmit={handleEmailChange}>
              <div className="settings-modal-body">
                
                <div className="settings-form-group">
                  <input
                    type="email"
                    placeholder="Enter current email"
                    required
                    className="settingsTextInput"
                    name="currentEmail"
                    value={currentEmail}
                    onChange={(email) => setCurrentEmail(email.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    className="settingsTextInput"
                    name="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
              </div>
              <div className="settings-modal-footer">
                <button type="submit" className="settings-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={() => setShowChangePasswordModal(false)}>
                <span>&times;</span> {/* A simple 'x' for the close icon */}
              </button>
              <h4 className="modal-title">Change Password</h4>
            </div>
            <form onSubmit={handlePasswordReset}>
              <div className="settings-modal-body">
                <div className="settings-form-group">
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    className="settingsTextInput"
                    name="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
              </div>
              <div className="settings-modal-footer">
                <button type="submit" className="settings-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showChangeNicknameModal && (
        <div className="modal-overlay" onClick={() => setShowChangeNicknameModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={() => setShowChangeNicknameModal(false)}>
                <span>&times;</span> {/* A simple 'x' for the close icon */}
              </button>
              <h4 className="modal-title">Change Nickname</h4>
            </div>
            <form onSubmit={handleChangeNickname}>
              <div className="settings-modal-body">
                <input
                  type="text"
                  placeholder="Enter new nickname"
                  maxLength={20}
                  className="settingsTextInput"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
                <div className="change-display-name-feedback-container">
                  <span className="count-down">{newNickname.length}/20</span>
                </div>
                <p className="text-description">
                  This is how you will appear to others.
                </p>
              </div>
              <div className="settings-modal-footer">
                <button type="submit" className="settings-btn">Save</button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
