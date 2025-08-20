"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { signOut } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type HeaderProps = {
    user: any;
};

const PageHeader: React.FC<HeaderProps> = ({user}) => {
    const router = useRouter();
    const pathname = usePathname();

    const [profileHovered, setProfileHovered] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);

    const homePage = () => {
        window.location.href = '/';
    };

    const handleHistory = async () => {
        window.location.href = '/history';
    }

    const settingsPage = () => {
        window.location.href = '/settings';
    }

    const memberPage = () => {
        window.location.href = '/member/' + user.user_metadata?.username;
    }

    const signinPage = () => {
        router.push('/signin');
    }

    const handleSignOut = async () => {
        try{
            await signOut();
            window.location.href = '/';
        } 
        catch (error){
            toast.error('Error signing out.');
        }
    };

    const handleMouseEnter = () => {
        setTimeout(() => setProfileHovered(true), 70);
        setProfileVisible(true);
    };

    const handleMouseLeave = () => {
        setProfileHovered(false);
        setTimeout(() => setProfileVisible(false), 250);
    };

    const isGuestPage = pathname.startsWith('/guest');
    const isHomePage = pathname === '/';
    const isHistoryPage = pathname === '/history';
    const isSignIn = pathname === '/signin';
    const isSignUp = pathname === '/signup';
    const isConfirmSign = pathname === '/confirm-signup';

    return (
        <>
            {isHomePage && (<ToastContainer className="home-toast"/>)}
            <header className="header-container">
                <div className="header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="header-logo"></img>
                    <img src="/straight-header-logo-text.png" className="header-logo-text"></img>
                </div>

                {!isGuestPage && (
                    <div className="header-info-container">
                        {isHomePage && (
                            <>
                                <button className="header-contact-us-button" onClick={() => document.getElementById("contact-us")?.scrollIntoView({ behavior: 'smooth' })}>
                                    Contact Us
                                </button>
                                <button className="header-learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                                    Learn More
                                </button>
                            </>
                        )}
                        
                        {!isHistoryPage && user && (
                            <button className="header-my-games-button" onClick={handleHistory}>
                                My Games
                            </button>
                        )}

                        {user && (
                            <div className="header-profile-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <img
                                    src={user.user_metadata?.avatar_url || "/default-profile-picture.jpg"}
                                    className="header-profile"
                                    alt="Profile"
                                />
                                {profileVisible && (
                                    <div className={`header-profile-dropdown header-slide-fade ${profileHovered ? "show" : "hide"}`}>
                                        <button className="header-profile-dropdown-button" onClick={memberPage}>
                                            <span className="header-profile-dropdown-icon">👤</span>
                                            <span className="header-profile-dropdown-text">Profile</span>
                                        </button>
                                        <button className="header-profile-dropdown-button" onClick={settingsPage}>
                                            <span className="header-profile-dropdown-icon">⚙️</span>
                                            <span className="header-profile-dropdown-text">Settings</span>
                                        </button>
                                        <div className="header-profile-dropdown-divider"></div>
                                        <button className="header-profile-dropdown-button sign-out" onClick={handleSignOut}>
                                            <span className="header-profile-dropdown-icon">⏻</span>
                                            <span className="header-profile-dropdown-text">Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {(!isSignIn && !isSignUp && !isConfirmSign) && !user && (
                            <button className="header-sign-in-button" onClick={signinPage}>
                                ↪ Sign In
                            </button>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

export default PageHeader;
