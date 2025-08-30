"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import "@/src/app/styles/Member.css";

interface MemberNavbarProps {
    username: string;
    randomUsername: string;
}

export const MemberNavbar: React.FC<MemberNavbarProps> = ({ username, randomUsername }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setIsDropdownOpen(false);
    }

    const isActive = (path: string) => {    
        return pathname === path;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav className="member-navbar">
            {/* Always visible links */}
            <a 
                onClick={() => handleNavigation(`/member/${username}`)} 
                className={`member-navbar-link member-navbar-link-visible ${isActive(`/member/${username}`) ? 'active' : ''}`}
            >
                Overview
            </a>
            <a 
                onClick={() => handleNavigation(`/member/${username}/stats`)} 
                className={`member-navbar-link member-navbar-link-visible ${isActive(`/member/${username}/stats`) ? 'active' : ''}`}
            >
                Stats
            </a>
            
            {/* Desktop-only links */}
            <a onClick={() => handleNavigation(`/member/${randomUsername}`)} className='member-navbar-link member-navbar-link-desktop'>
                Friends
            </a>
            <a onClick={() => handleNavigation(`/member/${username}`)} className='member-navbar-link member-navbar-link-desktop'>
                Achievements
            </a>
            <a onClick={() => handleNavigation(`/member/${username}`)} className='member-navbar-link member-navbar-link-desktop'>
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
                        <a onClick={() => handleNavigation(`/member/${randomUsername}`)} className='member-navbar-dropdown-link member-navbar-link'>
                            Friends
                        </a>
                        <a onClick={() => handleNavigation(`/member/${username}`)} className='member-navbar-dropdown-link member-navbar-link'>
                            Achievements
                        </a>
                        <a onClick={() => handleNavigation(`/member/${username}`)} className='member-navbar-dropdown-link member-navbar-link'>
                            Game History
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};
