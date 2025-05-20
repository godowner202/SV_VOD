import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MovieCard({ movie, priority = false, showDetails = true }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  // Handle click depending on whether showDetails is true
  const handleClick = (e) => {
    if (!showDetails) {
      e.preventDefault();
      router.push(`/player/${movie.id}`);
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link 
      href={`/movie/${movie.id}`} 
      className="block group relative" 
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
        {/* Movie Poster */}
        {movie.poster_path && !imageError ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
            </svg>
            <span className="text-sm text-gray-400">{movie.title}</span>
          </div>
        )}
        
        {/* Overlay - Only show on hover or if showDetails is false */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black to-transparent pt-4 px-3 pb-3 flex flex-col justify-end transition-opacity duration-300 ${showDetails ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          {showDetails ? (
            <>
              <h3 className="font-semibold text-sm">{movie.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-300">{movie.release_date?.split('-')[0] || 'Unknown'}</span>
                {movie.vote_average > 0 && (
                  <span className="bg-purple-600 px-1.5 py-0.5 rounded text-xs">
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="bg-purple-600 rounded-full p-3 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Title - Only show if showDetails is false */}
      {!showDetails && (
        <div className="mt-2">
          <h3 className="text-sm font-medium truncate" title={movie.title}>{movie.title}</h3>
        </div>
      )}
    </Link>
  );
}