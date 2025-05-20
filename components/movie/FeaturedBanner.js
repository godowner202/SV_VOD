import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FeaturedBanner({ movie }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  
  // Extract trailer if available
  useEffect(() => {
    if (movie?.videos?.results) {
      const trailer = movie.videos.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        setTrailerKey(trailer.key);
      }
    }
  }, [movie]);

  // If no movie data, show placeholder
  if (!movie) {
    return (
      <div className="relative h-[70vh] min-h-[500px] bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[500px]">
      {/* Preload the backdrop image */}
      <div className="hidden">
        <img 
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
          alt=""
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      {/* Backdrop Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
      </div>

      {/* Loading Placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800"></div>
      )}

      {/* Featured Content */}
      <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 flex flex-col justify-end h-full">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
          <span>{new Date(movie.release_date).getFullYear()}</span>
          <span className="bg-purple-600 px-2 py-1 rounded text-sm">
            {movie.vote_average.toFixed(1)}/10
          </span>
          {movie.runtime && (
            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
          )}
        </div>
        
        <p className="text-gray-300 mb-6 max-w-xl line-clamp-3 md:line-clamp-4">
          {movie.overview}
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href={`/player/${movie.id}`}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md font-semibold flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch Now
          </Link>
          
          <Link 
            href={`/movie/${movie.id}`}
            className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-md font-semibold transition-colors"
          >
            More Info
          </Link>
          
          {trailerKey && (
            <a 
              href={`https://www.youtube.com/watch?v=${trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border border-white hover:bg-white/10 px-6 py-3 rounded-md font-semibold transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Watch Trailer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}