"use client";

import { useRouter } from 'next/navigation'
import React from 'react';

import "./styles/General.css"
import "./styles/Home.css"

export default function Home() {
  const router = useRouter();

  const homePage = () => {
      router.push('/');
  }

  const signinPage = () => {
      router.push('/signin');
  }
  
  const signupPage = () => {
      router.push('signup');
  }

  return (
    <div className="home-title-box">
        <div className="logo-box" onClick={homePage}>
            <img src="/straight-tracker-logo.png" className="logo-css"></img>
            <p className="home-title-name">
                Straight Tracker
            </p>
        </div>
        <div className="login-box">
            <button className="sign-in-css" onClick={signinPage}>
                Sign in
            </button>
            <button className="sign-up-css" onClick={signupPage}>
                Sign up
            </button>
        </div>
    </div>
  );
}
