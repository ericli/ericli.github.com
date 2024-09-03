import React, { useState, useEffect, useRef } from 'react';
import homeSticker from '../assets/stickers/home.png';
import resumeSticker from '../assets/stickers/resume.png';
import blogSticker from '../assets/stickers/blog.png';

const StickerButton = ({ label, link, imageSrc, position }) => {
    const [currentPosition, setCurrentPosition] = useState(position);
    const [isDragging, setIsDragging] = useState(false);
    const stickerRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const clickStart = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e) => {
      const rect = stickerRef.current.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      clickStart.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    };
  
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        setCurrentPosition({ x: newX, y: newY });
      }
    };
  
    const handleMouseUp = (e) => {
      setIsDragging(false);
      const diffX = Math.abs(e.clientX - clickStart.current.x);
      const diffY = Math.abs(e.clientY - clickStart.current.y);
      if (diffX < 5 && diffY < 5) {
        window.location.href = link;
      }
    };
  
    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);
  
    return (
      <div 
        ref={stickerRef}
        className="absolute cursor-move"
        style={{
          left: `${currentPosition.x}px`,
          top: `${currentPosition.y}px`,
          userSelect: 'none',
          width: '300px',
          height: '150px',
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          transition: isDragging ? 'none' : 'filter 0.3s ease-in-out',
          cursor: 'move',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img 
            src={imageSrc} 
            alt={label} 
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}
            draggable="false"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    );
  };

const DraggableStickerNavigation = () => {
  const stickers = [
    { label: 'Home', link: '/', imageSrc: homeSticker, position: { x: 600, y: 50 } },
    { label: 'Resume', link: '/resume.pdf', imageSrc: resumeSticker, position: { x: 200, y: 200 } },
    { label: 'Blog', link: 'https://substack.com/@measureit', imageSrc: blogSticker, position: { x: 800, y: 250 } },
    // { label: 'Contact', link: '/contact', imageSrc: contactSticker, position: { x: 300, y: 300 } },
  ];

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {stickers.map((sticker, index) => (
        <StickerButton key={index} {...sticker} />
      ))}
    </div>
  );
};

export default DraggableStickerNavigation;