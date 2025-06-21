"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/src/components/Header';
import "@/src/app/styles/General.css"
import "@/src/app/styles/Select.css"

const Select: React.FC = () => {
    const router = useRouter();
    
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');

    const changeName1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName1(e.target.value);
    };

    const changeName2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName2(e.target.value);
    }


    const nextPage = () => {
        router.push('/tracker');
    }

    const enter_nextPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter'){
            nextPage();
        }
    }

    return (
        <div className='page-box'>
            <Header></Header>

            <p className="tracker-title-css">
                8-Ball Score Tracker
            </p>
            <div className="names-selection-message">
                <p className="names-message">
                    Players, Type Your Names.
                </p>
            </div>
            

            {/* <div className="input-names-box">
                <input placeholder="Player 1 Name" className="input-names-box1" onChange={changeName1} onKeyDown={enter_nextPage}> 
                </input>
                <input placeholder="Player 2 Name" className="input-names-box2" onChange={changeName2} onKeyDown={enter_nextPage}>
                </input>

                <p className="input-names">
                    Player 1: <span className="changed-name1">{name1}</span>
                </p>
                <p className="input-names">
                    Player 2: <span className="changed-name2">{name2}</span>
                </p>
            </div> */}

            {/* <div className="next-button-box">
                <button className="next-button" onClick={nextPage}>
                    Next
                </button>
            </div> */}
        </div>
    )
}

export default Select