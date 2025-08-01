"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, ReactNode } from 'react';
import { getUserSession, signOut } from '@/actions/auth';
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
    
    const homePage = () => {
        router.push('/');
    };

    const handleHistory = async () => {
        router.push('/history');
    }

    const settingsPage = () => {
        router.push('/settings');
    }

    const signinPage = () => {
        router.push('/signin');
    }

    const handleSignOut = async () => {
        try{
            await signOut();
        } 
        catch (error){
            toast.error('Error signing out.');
        }
    };

    const isGuestPage = pathname.startsWith('/guest');
    const isHomePage = pathname === '/';
    const isHistoryPage = pathname === '/history';

    return (
        <>
            <ToastContainer/>
            <header className="header-title-container">
                <div className="header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="header-logo-css"></img>
                    <img src="/straight-header-logo-text.png" className="header-logo-text-css"></img>
                </div>

                {!isGuestPage && (
                    <div className="login-box">
                        <div className="header-buttons-box">
                            {isHomePage && (
                                <>
                                    <button className="contact-us-button" onClick={() => document.getElementById("contact-us")?.scrollIntoView({ behavior: 'smooth' })}>
                                        Contact Us
                                    </button>
                                    <button className="learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                                        Learn More
                                    </button>
                                </>
                            )}
                            
                            {!isHistoryPage && user && (
                                <button className="my-games-css" onClick={handleHistory}>
                                    My Games
                                </button>
                            )}

                            {user ? (
                                <div className="profile-container" onMouseEnter={() => setProfileHovered(true)} onMouseLeave={() => setProfileHovered(false)}>
                                    <img src="/default-profile-picture.jpg" className="profile-css"></img>
                                    {profileHovered && (
                                        <div className="profile-dropdown-menu">
                                            <button className="profile-dropdown-button" onClick={settingsPage}><span className="dropdown-icon">⚙️</span>Settings</button>
                                            <div className="dropdown-divider"></div>
                                            <button className="profile-dropdown-button sign-out" onClick={handleSignOut}><span className="dropdown-icon">⏻</span>Sign Out</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button className="sign-in-button" onClick={signinPage}>
                                    ↪ Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default PageHeader;
