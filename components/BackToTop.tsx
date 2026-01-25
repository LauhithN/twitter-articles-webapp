'use client';

import { useState, useEffect } from 'react';
import { ChevronUpIcon } from './Icons';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-6 right-6
        w-12 h-12
        bg-surface-1 border border-border-default
        hover:bg-surface-2 hover:border-accent
        text-text-secondary hover:text-accent
        flex items-center justify-center
        transition-all duration-200
        shadow-lg
        z-50
      "
      aria-label="Back to top"
    >
      <ChevronUpIcon className="w-5 h-5" />
    </button>
  );
}
