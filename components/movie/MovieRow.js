import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, showViewAll = false, viewAllLink, categoryId }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Check if scroll arrows should be shown
  useEffect(() => {
    const checkScroll = () => {
      if (!rowRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };
    
    // Initial check
    checkScroll();
    
    // Add event listener
    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll);
    }
    
    // Recalculate on window resize
    window.addEventListener('resize', checkScroll);
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [movies]);

  // Scroll the row left or right
  const scroll = (direction) => {
    if (!rowRef.current) return;
    
    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
    
    rowRef.current.scrollBy({ 
      left: scrollAmount, 
      behavior: 'smooth' 
    });
  };

  // Mouse handlers for dragging to scroll on desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeft(rowRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    rowRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // If no movies, don't render
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      {/* Row Header */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {showViewAll && viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-gray-400 hover:text-white flex items-center transition-colors">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
        
        {showViewAll && !viewAllLink && categoryId && (
          <Link href={`/browse?genre=${categoryId}`} className="text-sm text-gray-400 hover:text-white flex items-center transition-colors">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>
      
      {/* Movie Row Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 h-full px-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Scroll left"
          >
            <div className="h-12 w-12 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        )}
        
        {/* Movie Cards Row */}
        <div
          ref={rowRef}
          className="flex overflow-x-scroll scrollbar-hide space-x-4 px-4 md:px-8 py-2"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-shrink-0 w-36 sm:w-40 md:w-48 lg:w-56">
              <MovieCard movie={movie} priority={index < 2} />
            </div>
          ))}
        </div>
        
        {/* Right Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 h-full px-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Scroll right"
          >
            <div className="h-12 w-12 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}