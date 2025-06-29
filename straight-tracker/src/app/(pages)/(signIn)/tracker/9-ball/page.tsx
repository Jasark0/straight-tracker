"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    return (
        <div className="main-box">
            <Header></Header>
            <div className="race-text-box">
                <p className="race-text">
                    Race to 10
                </p>
                <p className="race-text">
                    -
                </p>
                <p className="race-text">
                    Race to 5 sets
                </p>
            </div>

            <p className="set-text">
                (Set 1)
            </p>
                
            <div className="score-box">
                <div className="player1-box">
                    <p className="player1-text">
                        Jason
                    </p>

                    <div className="player1-score-box">
                        <p className="player1-score">
                            0
                        </p>
                        <button className="player1-increment">
                            +
                        </button>
                    </div>

                    <div className="player1-sets-box">
                        <p className="player1-set">
                            0
                        </p>
                        <p className="player1-set-text">
                            Sets
                        </p>
                    </div>
                </div>

                <div className="player2-box">
                    <p className="player2-text">
                        John
                    </p>

                    <div className="player1-score-box">
                        <p className="player2-score">
                            0
                        </p>
                        <button className="player2-increment">
                            +
                        </button>
                    </div>

                    <div className="player2-sets-box">
                        <p className="player2-set">
                            0
                        </p>
                        <p className="player2-set-text"> 
                            Sets
                        </p>
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