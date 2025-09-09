'use client';

import { useEffect, useState } from 'react';

const PacmanCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('right');

  useEffect(() => {
    let lastX = 0;
    
    const updateMousePosition = (e) => {
      const newX = e.clientX;
      
      // Determine direction based on mouse movement
      if (newX > lastX + 3) {
        setDirection('right');
      } else if (newX < lastX - 3) {
        setDirection('left');
      }
      
      setMousePosition({ x: newX, y: e.clientY });
      lastX = newX;
    };

    // Hide default cursor
    document.body.style.cursor = 'none';
    
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      // Restore default cursor when component unmounts
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-150 ease-out"
      style={{
        left: mousePosition.x - 20,
        top: mousePosition.y - 20,
        transform: `scaleX(${direction === 'left' ? -1 : 1}) rotate(${direction === 'left' ? '-15deg' : '15deg'})`
      }}
    >
      {/* Purple Ghost SVG - Larger Size */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl filter"
      >
        <path
          d="M12 2C8.13401 2 5 5.13401 5 9V18C5 18.5523 5.44772 19 6 19C6.55228 19 7 18.5523 7 18V17C7 16.4477 7.44772 16 8 16C8.55228 16 9 16.4477 9 17V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V17C15 16.4477 15.4477 16 16 16C16.5523 16 17 16.4477 17 17V18C17 18.5523 17.4477 19 18 19C18.5523 19 19 18.5523 19 18V9C19 5.13401 15.866 2 12 2Z"
          fill="#884ea5"
          stroke="#521962"
          strokeWidth="0.5"
        />
        {/* Eyes */}
        <circle cx="9" cy="8" r="1.8" fill="white" />
        <circle cx="15" cy="8" r="1.8" fill="white" />
        <circle cx="9" cy="8" r="1" fill="#521962" />
        <circle cx="15" cy="8" r="1" fill="#521962" />
        
        {/* Animated glow effect */}
        <circle 
          cx="12" 
          cy="10" 
          r="8" 
          fill="none" 
          stroke="#f5adc4" 
          strokeWidth="1" 
          opacity="0.3"
          className="animate-ping"
        />
      </svg>
    </div>
  );
};

export default PacmanCursor;