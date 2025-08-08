"use client";

import React from 'react';
import '@/src/app/styles/Loading.css'

const PageLoading: React.FC = () => {
    return (
        <div className="loading-page-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading page info...</p>
        </div>
    );
};

export default PageLoading;