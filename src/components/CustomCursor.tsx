import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Gold color palette - matching Footer component
const goldColors = {
  primary: '#D4AF37',
  light: '#F4E4B8',
  dark: '#B8941F',
  hover: '#E5C158',
  shadow: 'rgba(212, 175, 55, 0.5)',
  shadowStrong: 'rgba(212, 175, 55, 0.6)',
};

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3 });
    };

    // Show only on large viewports — styles in Home still hide for small screens
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-2 h-2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden lg:block"
        style={{ 
          backgroundColor: goldColors.primary,
          zIndex: 999999
        }}
      />
      <div
        ref={followerRef}
        className="fixed w-8 h-8 border-2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{ 
          borderColor: goldColors.primary,
          zIndex: 999999
        }}
      />
    </>
  );
};

export default CustomCursor;