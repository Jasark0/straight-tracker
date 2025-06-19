"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/History.css"

export default function History() {
    const router = useRouter();

    const homePage = () => {
        router.push('/');
    }

    return (
        <div className="history-page-box">
            <div className="home-title-box">
                <div className="logo-box" onClick={homePage}>
                <img src="/straight-tracker-logo.png" className="logo-css"></img>
                <p className="home-title-name">
                    Straight Tracker
                </p>
                </div>
            </div>
            <div className="history-box">
                <button className="new-game">+ New Game</button>

                <div className="search-row-box">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input className="search-input" placeholder="Search game name" />
                    </div>
                    <button className="icon-button">
                        📅
                    </button>
                    <button className="icon-button">
                        ⬇️
                    </button>
                </div>

                <div className="display-history-box">
                    <div className="history-placeholder-box">
                    </div>
                </div>
            </div>
        </div>
    );
}
