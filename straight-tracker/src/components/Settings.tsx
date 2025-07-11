import React, { useState } from "react";
import { Edit } from "lucide-react";
// Make sure to remove the CSS module import, e.g., import styles from './Settings.module.css';

interface AccountInfoProps {
  nickname?: string;
  username?: string;
  email?: string;
  profileImage?: string;
}


export function Settings({
  nickname = "User's Nickname",
  username = "User's Username",
  email = "User's Email",
  profileImage,
}: AccountInfoProps) {

  const [showChangePassword, setShowChangePassword] = useState(false);


  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          Manage your account information and preferences
        </p>
      </div>

      <div className="settings-content">
        {/* Profile Image Section */}
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
            <button className="settings-changeImageButton">
              Change Image
            </button>
            <div className="settings-filename">img.png</div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="settings-infoSection">
          <h2 className="settings-infoTitle">Account Info</h2>

          <div className="settings-fields">
            {/* Nickname */}
            <div className="settings-fieldRow">
              <div className="settings-fieldContent">
                <span className="settings-fieldLabel">Nickname: </span>
                <span className="settings-fieldValue">{nickname}</span>
              </div>
              <button className="settings-editButton">
                <Edit className="settings-editIcon" />
              </button>
            </div>

            {/* Username */}
            <div className="settings-fieldRow">
              <div className="settings-fieldContent">
                <span className="settings-fieldLabel">Username: </span>
                <span className="settings-fieldValue">{username}</span>
              </div>
            </div>

            {/* Email */}
            <div className="settings-fieldRow">
              <div className="settings-fieldContent">
                <span className="settings-fieldLabel">Email: </span>
                <span className="settings-fieldValue">{email}</span>
              </div>
              <button className="settings-editButton">
                <Edit className="settings-editIcon" />
              </button>
            </div>

            {/* Password */}
            <div className="settings-fieldRow">
              <div className="settings-fieldContent">
                <span className="settings-fieldLabel">Password: </span>
                <span className="settings-fieldValue">*********</span>
              </div>
              <button className="settings-editButton" onClick={() => setShowChangePassword(true)}>
                <Edit className="settings-editIcon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings