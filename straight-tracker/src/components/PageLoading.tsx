"use client";

import React from 'react';

const PageLoading: React.FC = () => {
    return (
        <div className="page-box">
            <div className="loading-screen">
                <div className="loading-content">
                    <p>Loading page info...</p>
                    <img src="/spinner.gif" className="spinner-css" alt="Loading..."></img>
                </div>
            </div>
        </div>
    );
};

export default PageLoading;