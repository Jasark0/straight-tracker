"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    return (
        <div className="s-main-box">
            <Header></Header>
            
            <div className="remaining-balls-container">
                <p className="remaining-balls-style remaining-balls">
                    
                    15
                </p>
                <p className="remaining-balls-style">
                    Remaining Balls
                </p>
                <p className="rack-number">
                    (Rack 1)
                </p>
            </div>
            
            <div className="s-player-boxes">
                <div className="s-player1-box">
                    <p id = "player1" className="s-player1-name">Jason</p>
                    <div className="s-score-box">
                        <button className="s-decrement-button">-</button>
                        <p className="s-player1-score">0</p>
                        <div className="s-increment-box">
                            <button className="s-increment-button">+</button>
                            <button className="s-increment-button">+2</button>
                            <div className="CR-box">
                                <button className="s-increment-button">CR</button>
                                <button className="CR-icon">i</button>
                            </div>
                        </div>
                    </div>
        
                    <div className="high-style player1-high-run">
                        High Run: 0
                    </div>
                    <div className="high-style player1-curr-high-run">
                        Current High Run: 0
                    </div>
                </div>
        
                
                <div>
                    <img src="/leftArrow.png" className="image-style" id="player-turn"></img>
                    <div className="player-turn-text-style" id="player-turn-text">
                    </div>
                    <div className="player-swap-text-style">
                        (Press spacebar to swap turn)
                    </div>
                </div>
                
                <div className="s-player2-box">
                    <p id = "player2" className="s-player2-name">John</p>
                    <div className="s-score-box">
                        <button className="s-decrement-button">-</button>
                        <p className="s-player2-score">0</p>
                        <div className="s-increment-box">
                            <button className="s-increment-button">+</button>
                            <button className="s-increment-button">+2</button>
                            <button className="s-increment-button">CR</button>
                        </div>     
                    </div>

                    <div className="high-style player2-high-run">
                        High Run: 0
                    </div>
                    <div className="high-style player2-curr-high-run">
                        Current High Run: 0
                    </div>
                </div>
            </div>

            <div className="undo-box">
                <button className="undo-style">Undo</button>
            </div>
        </div>

    )
}

export default Tracker