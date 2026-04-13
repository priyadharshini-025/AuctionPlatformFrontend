import React, { useState, useRef } from 'react';

const ImageZoom = ({ src, alt, className = "" }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleTouchStart = () => {
    setIsZoomed(!isZoomed);
  };

  const handleTouchMove = (e) => {
    if (!isZoomed || !imageRef.current) return;

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}
        style={{
          transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          🔍 {window.innerWidth <= 768 ? 'Tap to zoom out' : 'Zoom'}
        </div>
      )}

      {/* Mobile zoom hint */}
      {!isZoomed && window.innerWidth <= 768 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          👆 Tap to zoom
        </div>
      )}

      {/* Zoom lens effect (desktop only) */}
      {isZoomed && window.innerWidth > 768 && (
        <div
          className="absolute border-2 border-white pointer-events-none"
          style={{
            width: '100px',
            height: '100px',
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;