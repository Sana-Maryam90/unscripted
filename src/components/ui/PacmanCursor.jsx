'use client';

import { useEffect, useState } from 'react';

const PacmanCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => {
      const newX = e.clientX;
      const newY = e.clientY;
      
      // Calculate angle based on movement direction
      const deltaX = newX - prevPosition.x;
      const deltaY = newY - prevPosition.y;
      
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) { // Only update angle if significant movement
        const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        setAngle(newAngle);
        setPrevPosition({ x: newX, y: newY });
      }
      
      setPosition({ x: newX, y: newY });
    };

    document.addEventListener('mousemove', updatePosition);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
    };
  }, [prevPosition]);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out"
      style={{
        left: position.x - 16,
        top: position.y - 16,
        transform: `rotate(${angle}deg)`,
      }}
    >
      {/* Pacman Ghost from your assets */}
      <div className="relative w-8 h-8">
        <img 
          src="/images/designAssets/Clip path group-2.png" 
          alt="Ghost Cursor" 
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>
    </div>
  );
};

export default PacmanCursor;
