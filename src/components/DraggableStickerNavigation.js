import React, { useState, useEffect, useCallback } from 'react';
import homeSticker from '../assets/stickers/home.png';
import resumeSticker from '../assets/stickers/resume.png';
import blogSticker from '../assets/stickers/blog.png';

const StickerButton = ({ label, link, imageSrc, position, size, zIndex, onDragStart }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const stickerRef = React.useRef(null);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const clickStart = React.useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const rect = stickerRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    clickStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    onDragStart();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const containerRect = stickerRef.current.parentElement.getBoundingClientRect();
      
      let newX = ((e.clientX - dragStart.current.x) / containerRect.width) * 100;
      let newY = ((e.clientY - dragStart.current.y) / containerRect.height) * 100;

      // Constrain the sticker within the container
      newX = Math.max(0, Math.min(newX, 100 - size.width));
      newY = Math.max(0, Math.min(newY, 100 - size.height));

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

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleMouseDown(touch);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMouseMove(touch);
  };

  const handleTouchEnd = (e) => {
    handleMouseUp(e.changedTouches[0]);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Adjust this value to change the visible size of the sticker relative to its hitbox
  const visibleSizeRatio = 0.8; // 80% of the hitbox size

  return (
    <div 
      ref={stickerRef}
      className="absolute cursor-move"
      style={{
        left: `${currentPosition.x}%`,
        top: `${currentPosition.y}%`,
        userSelect: 'none',
        width: `${size.width}%`,
        height: `${size.height}%`,
        transition: isDragging ? 'none' : 'filter 0.3s ease-in-out',
        cursor: 'move',
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
      >
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            width: `${visibleSizeRatio * 100}%`,
            height: `${visibleSizeRatio * 100}%`,
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          }}
        >
          <img 
            src={imageSrc} 
            alt={label} 
            className={`w-full h-full object-contain transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}
            draggable="false"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

const DraggableStickerNavigation = () => {
  const [stickers, setStickers] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const updateWindowSize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, [updateWindowSize]);

  const generateStickers = useCallback(() => {
    const aspectRatio = 2; // width:height ratio of our stickers
    const maxStickerWidth = Math.min(30, (windowSize.width / 3) / (windowSize.width / 100));
    const stickerSize = {
      width: maxStickerWidth,
      height: maxStickerWidth / aspectRatio
    };

    const homePosition = { 
      x: (100 - stickerSize.width) / 2, 
      y: 3
    };

    const isColliding = (pos1, pos2) => {
      const buffer = 2;
      return (
        pos1.x < pos2.x + stickerSize.width + buffer &&
        pos1.x + stickerSize.width + buffer > pos2.x &&
        pos1.y < pos2.y + stickerSize.height + buffer &&
        pos1.y + stickerSize.height + buffer > pos2.y
      );
    };

    const getRandomPosition = (existingPositions) => {
      const maxX = 100 - stickerSize.width;
      const maxY = 100 - stickerSize.height;
      const minY = homePosition.y + stickerSize.height + 5;
      
      let newPosition;
      let collisionFound;

      do {
        collisionFound = false;
        newPosition = {
          x: Math.random() * maxX,
          y: Math.random() * (maxY - minY) + minY
        };

        for (let pos of existingPositions) {
          if (isColliding(newPosition, pos)) {
            collisionFound = true;
            break;
          }
        }
      } while (collisionFound);

      return newPosition;
    };

    const newStickers = [
      { label: 'Home', link: '/', imageSrc: homeSticker, position: homePosition, size: stickerSize, zIndex: 1 }
    ];

    const otherStickers = [
      { label: 'Resume', link: '/resume.pdf', imageSrc: resumeSticker },
      { label: 'Blog', link: '/blog', imageSrc: blogSticker },
    ];

    otherStickers.forEach(sticker => {
      const position = getRandomPosition(newStickers.map(s => s.position));
      newStickers.push({ ...sticker, position, size: stickerSize, zIndex: 1 });
    });

    return newStickers;
  }, [windowSize]);

  useEffect(() => {
    setStickers(generateStickers());
  }, [generateStickers]);

  const handleDragStart = (index) => {
    setStickers(prevStickers => {
      const newStickers = [...prevStickers];
      const maxZIndex = Math.max(...newStickers.map(s => s.zIndex));
      newStickers[index].zIndex = maxZIndex + 1;
      return newStickers;
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {stickers.map((sticker, index) => (
        <StickerButton 
          key={index} 
          {...sticker} 
          onDragStart={() => handleDragStart(index)}
        />
      ))}
    </div>
  );
};

export default DraggableStickerNavigation;