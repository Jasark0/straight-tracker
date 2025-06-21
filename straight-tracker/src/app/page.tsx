"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';

import "./styles/General.css"
import "./styles/Home.css"
import { getUserSession, signOut } from '@/actions/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession();
      setUser(session?.user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const homePage = () => {
      router.push('/');
  }

  const signinPage = () => {
      router.push('/signin');
  }
  
  const signupPage = () => {
      router.push('signup');
  }

  const handleHistory = async () => {
    router.push('/history');
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a complete page reload to ensure fresh state
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: manually refresh the user state
      const session = await getUserSession();
      setUser(session?.user || null);
    }
  };

  return (
    <div className="page-box">
      <div className="home-title-box">
          <div className="logo-box" onClick={homePage}>
              <img src="/straight-tracker-logo.png" className="logo-css"></img>
              <p className="home-title-name">
                  Straight Tracker
              </p>
          </div>
          <div className="login-box">
            {isLoading ? (
              <div>Loading...</div>
            ) : user ? (
              <div className="header-buttons-box">
                <button className="sign-up-css" onClick={handleHistory}>
                  History Page
                </button>
                <button className="sign-up-css" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <button className="sign-in-css" onClick={signinPage}>
                    Sign in
                </button>
                <button className="sign-up-css" onClick={signupPage}>
                    Sign up
                </button>
              </>
            )}
          </div>
      </div>
    </div>
  );
}
