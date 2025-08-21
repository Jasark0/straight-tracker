"use client";

import React, { useState, useRef, useEffect } from 'react';

interface MemberNavbarProps {
    username: string;
    randomUsername: string;
}

export const MemberNavbar: React.FC<MemberNavbarProps> = ({ username, randomUsername }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        // Add event listener when dropdown is open
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav className="member-navbar">
            {/* Always visible links */}
            <a href={`/member/${username}`} className='member-navbar-link member-navbar-link-visible'>
                Overview
            </a>
            <a href={`/member/${username}`} className='member-navbar-link member-navbar-link-visible'>
                Stats
            </a>
            
            {/* Desktop-only links */}
            <a href={`/member/${randomUsername}`} className='member-navbar-link member-navbar-link-desktop'>
                Friends
            </a>
            <a href={`/member/${username}`} className='member-navbar-link member-navbar-link-desktop'>
                Achievements
            </a>
            <a href={`/member/${username}`} className='member-navbar-link member-navbar-link-desktop'>
                Game History
            </a>

            {/* Mobile dropdown */}
            <div className="member-navbar-dropdown" ref={dropdownRef}>
                <button 
                    onClick={toggleDropdown}
                    className='member-navbar-link member-navbar-more-button'
                    aria-expanded={isDropdownOpen}
                >
                    More ▼
                </button>
                
                {isDropdownOpen && (
                    <div className="member-navbar-dropdown-content">
                        <a href={`/member/${randomUsername}`} className='member-navbar-dropdown-link'>
                            Friends
                        </a>
                        <a href={`/member/${username}`} className='member-navbar-dropdown-link'>
                            Achievements
                        </a>
                        <a href={`/member/${username}`} className='member-navbar-dropdown-link'>
                            Game History
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};
