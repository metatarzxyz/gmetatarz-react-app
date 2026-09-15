// Create src/components/Logo.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="logo-container" onClick={() => navigate('/')}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Main B shape with circuit pattern */}
        <path
          d="M24 4L44 24L24 44L4 24L24 4Z"
          stroke="#00f7ff"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Neural network nodes */}
        <circle cx="24" cy="24" r="3" fill="#00f7ff" />
        <circle cx="34" cy="24" r="2" fill="#00f7ff" />
        <circle cx="14" cy="24" r="2" fill="#00f7ff" />
        <circle cx="24" cy="34" r="2" fill="#00f7ff" />
        <circle cx="24" cy="14" r="2" fill="#00f7ff" />
        {/* Animated glow */}
        <path
          d="M24 4L44 24L24 44L4 24L24 4Z"
          stroke="#00f7ff"
          strokeWidth="2"
          fill="none"
          className="logo-glow"
          opacity="0.5"
        />
      </svg>
      <span className="logo-text">gMetatarz</span>
    </div>
  );
};