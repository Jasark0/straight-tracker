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
    <div className={className}>
      <div className="logo-box" onClick={homePage}>
        <img src="/straight-tracker-logo.png" className="logo-css" alt="Straight Tracker Logo"></img>
        <p className="home-title-name">
          Straight Tracker
        </p>
      </div>
    </div>
  );
};

export default Header;
