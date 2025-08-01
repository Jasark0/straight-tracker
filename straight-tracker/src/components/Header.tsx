"use client";

import { useRouter } from 'next/navigation';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "home-title-box" }) => {
    const router = useRouter();

    const homePage = () => {
        router.push('/');
    };

    return (
        <header className="header-title-container">
            <div className="header-logo-container" onClick={homePage}>
                <img src="/straight-header-logo.png" className="header-logo-css"></img>
                <img src="/straight-header-logo-text.png" className="header-logo-text-css"></img>
            </div>
        </header>
    );
};

export default Header;
