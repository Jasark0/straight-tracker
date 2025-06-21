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

    const [showModal, setShowModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(".game-option")){
            setSelectedGame('');
        }
    }

    const selectPage = () => {
        if (selectedGame === "8 Ball"){
            router.push('/'); //Change to /select/8-ball
        }
        else if (selectedGame === "9 ball"){
            router.push('/'); //Change to /select/9-ball
        }
        else if (selectedGame === "10 ball"){
            router.push('/'); //Change to /select/10-ball
        }
        else if (selectedGame === "Straight Pool (14.1 Continuous)"){
            router.push('/'); //Change to /select/straight-pool
        }
        else if (selectedGame === "Snooker"){
            router.push('/'); //Change to /select/snooker
        }
    }

    const homePage = () => {
        router.push('/');
    }

    return (
        <div className="history-page-box">
            <div className={`home-title-box ${showModal ? "blurred" : ""}`}>
                <div className="logo-box" onClick={homePage}>
                <img src="/straight-tracker-logo.png" className="logo-css"></img>
                <p className="home-title-name">
                    Straight Tracker
                </p>
                </div>
            </div>
            <div className={`history-box ${showModal ? "blurred" : ""}`}>
                <button className="new-game" onClick={() => setShowModal(true)}>+ New Game</button>

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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={gameSelect}>
                        <h2>Select a Game Type</h2>
                        <div className="game-options">
                            {["8 Ball", "9 Ball", "10 Ball", "Straight Pool (14.1 Continuous)", "Snooker"].map((game) => (
                                <button className={`game-option ${selectedGame === game ? "selected" : ""}`} key={game} onClick={() => setSelectedGame(game)}>
                                    {game}
                                </button>
                            ))}
                        </div>

                        {selectedGame && (
                            <div className="confirm-footer">
                                <button className="next-button" onClick={selectPage}>Next</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
