"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { changeNickname, changePassword, changeUsername, getUserSession, updateAvatarInProfile, updateProfile } from '@/actions/auth';
import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Settings.css"
import { Edit } from "lucide-react";
import Avatar from './avatar';
import { toast ,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactiveButton from 'reactive-button';


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
  const [isSelecting, setIsSelecting] = useState(false);
  const [state, setState] = useState('idle');
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorAnimationClass, setErrorAnimationClass] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  let reactiveButtonColor = 'blue';

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession();
      setUser(session?.user);

      setLoading(false);

      if (session?.user) {
        try {
          const profileResult = await updateProfile();
          if (profileResult.status !== "success") {
            console.warn("Profile sync warning:", profileResult.status);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    };
    fetchUser();
  }, []);


  const resetStates = () => {
    setState('idle');
    setError(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  const onClickHandler = (callback: () => void) => {
    setState('loading');

    abortControllerRef.current = new AbortController();
    
    timeoutRef.current = setTimeout(() => { 
      if (!abortControllerRef.current?.signal.aborted) {
        callback();
      }
    }, 2500); 
  }

  const onError = (errorMessage: string) => {
    setState('error');
    setError(errorMessage);
    
    setErrorAnimationClass('entering');
    setIsErrorVisible(true);
    
    setTimeout(() => {
      setErrorAnimationClass('visible bounce-in');
    }, 50);
    
    setTimeout(() => {
      setErrorAnimationClass('exiting');
      
      setTimeout(() => {
        setError(null);
        setIsErrorVisible(false);
        setErrorAnimationClass('');
        resetStates();
      }, 400); 
    }, 2500); 
  }



  const handleMouseDown = () => {
    setIsSelecting(true);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const handleOverlayClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (isSelecting) {
      return;
    }

    resetStates();
    closeModal();
  }

  const handleEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (user && resetEmail.toLowerCase() !== user.email.toLowerCase()) {
      onError("The email provided does not match your account's email.");
      return;
    }

    if (abortControllerRef.current?.signal.aborted) {
      return;
    }

    const formData = new FormData();
    formData.append('email', resetEmail);

    try {
      const result = await changePassword(formData);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.status === "success") {
        setState('success');
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            setShowChangePasswordModal(false);
            toast.success("Password reset email sent! Please check your inbox.");
          }
        }, 1000);
      } else {
        onError(result.status);
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        onError("An error occurred while resetting password.");
      }
    }
  };

  const handleChangeNickname = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState('loading');

    if (!newNickname || newNickname.trim() === "") {
      onError("Nickname cannot be empty.");
      return;
    }

    if (abortControllerRef.current?.signal.aborted) {
      return;
    }

    const formData = new FormData();
    formData.append('nickname', newNickname);

    try {
      const result = await changeNickname(formData);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.status === "success") {
        setState('success');
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            setShowChangeNicknameModal(false);
            toast.success("Nickname updated successfully!");
          }
        }, 1000);
        const session = await getUserSession();
        setUser(session?.user);
      } else {
        onError(result.status);
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        onError("An error occurred while updating nickname.");
      }
    }
  };

  const handleChangeUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!newUsername || newUsername.trim() === "") {
      onError("Username cannot be empty.");
      return;
    }

    if (abortControllerRef.current?.signal.aborted) {
      return;
    }

    const formData = new FormData();
    formData.append('username', newUsername);

    try {
      const result = await changeUsername(formData);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.status === "success") {
        setState('success');
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            setShowChangeUsernameModal(false);
            toast.success("Username updated successfully!");
          }
        }, 1000);
        const session = await getUserSession();
        setUser(session?.user);
      } else {
        onError(result.status);
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        onError("An error occurred while updating username.");
      }
    }
  };

  const censorEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const censoredLocalPart = localPart.length > 2 ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] : localPart;
    return `${censoredLocalPart}@${domain}`;
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (state === 'error') {
    reactiveButtonColor ='red';
  } else if (state === 'success') {
    reactiveButtonColor ='green';
  }
  else if (state === 'loading') {
    reactiveButtonColor ='blue';
  }
  else if (state === 'idle') {
    reactiveButtonColor ='blue';
  }

  const closeNicknameModal = () => {
    setShowChangeNicknameModal(false);
    resetStates();
  }
  const closeUsernameModal = () => {
    setShowChangeUsernameModal(false);
    resetStates();
  } 
  const closeEmailModal = () => {
    setShowChangeEmailModal(false);
    resetStates();
  }
  const closePasswordModal = () => {
    setShowChangePasswordModal(false);
    resetStates();
  }


  const nickname = user?.user_metadata?.nickname;
  const username = user?.user_metadata?.username;
  const email = user?.email || "No Email";
  const profileImage = user?.user_metadata?.avatar_url || "/default-profile-picture.jpg";

  return (
    <div className="settings-page-box">
      <ToastContainer className="signin-toast" />
      <div className={`settings-container ${(showChangePasswordModal || showChangeNicknameModal || showChangeUsernameModal)  ? "blurred" : ""}`}>
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
                    const session = await getUserSession();
                    setUser(session?.user);
                    toast.success("Avatar updated successfully!");
                  } else {
                    toast.error("Error updating avatar: " + result.status);
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
                <button className="settings-editButton" onClick={() => {setShowChangeNicknameModal(true); resetStates();}}>
                  <Edit className="settings-editIcon" />
                </button>
              </div>

              <div className="settings-fieldRow">
                <div className="settings-fieldContent">
                  <span className="settings-fieldLabel">Username: </span>
                  <span className="settings-fieldValue">{username}</span>
                </div>
                <button className="settings-editButton" onClick={() => {setShowChangeUsernameModal(true); resetStates();}}>
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
                <button className="settings-editButton" onClick={() => {setShowChangePasswordModal(true); resetStates();}}>
                  <Edit className="settings-editIcon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChangeUsernameModal && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, closeUsernameModal)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={closeUsernameModal}>
                <span>&times;</span>
              </button>
              <h4 className="modal-title">Change Username</h4>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onClickHandler(() => handleChangeUsername(e));
            }}>
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
                <ReactiveButton 
                  type="submit"
                  idleText="Update"
                  loadingText="Updating..."
                  successText="Updated"
                  errorText="Error"
                  buttonState={state}
                  rounded={true}
                  shadow={true}
                  width={"100%"}
                  size='large'
                  color={reactiveButtonColor}
                />
              </div>
              {error && (
                <p className={`error-message ${errorAnimationClass}`}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      )}


      {showChangeEmailModal && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, closeEmailModal)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={closeEmailModal}>
                <span>&times;</span> {/* A simple 'x' for the close icon */}
              </button>
              <h4 className="modal-title">Change Email</h4>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onClickHandler(() => handleEmailChange(e));
            }}>
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
              </div>
              <div className="settings-modal-footer">
                <ReactiveButton
                  type="submit"
                  idleText="Update"
                  loadingText="Updating..."
                  successText="Updated"
                  errorText="Error"
                  buttonState={state}
                  rounded={true}
                  shadow={true}
                  width={"100%"}
                  size='large'
                  color={reactiveButtonColor}
                />
                {error && (
                  <p className={`error-message ${errorAnimationClass}`}>
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, closePasswordModal)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={closePasswordModal}>
                <span>&times;</span>
              </button>
              <h4 className="modal-title">Change Password</h4>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onClickHandler(() => handlePasswordReset(e));
            }}>
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
              </div>
              <div className="settings-modal-footer">
                <ReactiveButton 
                  type="submit"
                  idleText="Update"
                  loadingText="Updating..."
                  successText="Updated"
                  errorText="Error"
                  buttonState={state}
                  rounded={true}
                  shadow={true}
                  width={"100%"}
                  size='large'
                  color={reactiveButtonColor}
                />
              </div>
              {error && (
                <p className={`error-message ${errorAnimationClass}`}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      )}


      {showChangeNicknameModal && (
        <div className="modal-overlay" onClick={(e) => {
          handleOverlayClick(e, closeNicknameModal);
        }}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            <div className="settings-modal-header">
              <button type="button" className="close-button" title="Close" onClick={closeNicknameModal}>
                <span>&times;</span>
              </button>
              <h4 className="modal-title">Change Nickname</h4>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onClickHandler(() => handleChangeNickname(e));
            }}>
              <div className="settings-modal-body">
                <input
                  type="text"
                  placeholder="Enter new nickname"
                  maxLength={15}
                  className="settingsTextInput"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
                <div className="change-display-name-feedback-container">
                  <span className="count-down">{newNickname.length}/15</span>
                </div>
                <p className="text-description">
                  This is how you will appear to others.
                </p>
              </div>
              <div className="settings-modal-footer">
                <ReactiveButton 
                  type="submit"
                  idleText="Save"
                  loadingText="Saving..."
                  successText="Saved"
                  errorText="Error"
                  buttonState={state}
                  rounded={true}
                  shadow={true}
                  width={"100%"}
                  size='large'
                  color={reactiveButtonColor}
                />
              </div>
              {error && (
                <p className={`error-message ${errorAnimationClass}`}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
