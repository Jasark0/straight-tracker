"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    return (
        <div className="main-box">
            <Header></Header>
            <div>
                Snooker is in progress.
            </div>
        </div>

    )
}

export default Tracker