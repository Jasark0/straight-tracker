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
                <div className="">

                </div>

                <div>

                </div>
            </div>
            

            <div className="undo-box">
                <button className="undo-style">Undo</button>
            </div>
        </div>

    )
}

export default Tracker