import React, { useRef, useEffect } from 'react';
import { CursorStyle } from '../types';

interface CustomCursorProps {
  cursorStyle: CursorStyle;
  cursorColor: string;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ cursorStyle, cursorColor }) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const cursor = cursorRef.current;
      if (cursor) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          cursor.style.left = `${clientX}px`;
          cursor.style.top = `${clientY}px`;
        });

        const target = e.target as HTMLElement;
        const isTextInput = target.closest('input, textarea');
        const isInteractive = target.closest('button, a, .note-item, [onclick], .theme-preview, .cursor-preview, input[type="color"]');
        
        // Reset classes
        cursor.classList.remove('hover', 'text-input');

        if (isTextInput) {
          cursor.classList.add('text-input');
        } else if (isInteractive) {
          cursor.classList.add('hover');
        }
      }
    };

    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className={`custom-cursor ${cursorStyle}-style`} 
      style={{ '--cursor-color': cursorColor } as React.CSSProperties}
    />
  );
};

export default CustomCursor;