import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function Player() {
  const router = useRouter();
  const { id } = router.query;
  const playerRef = useRef(null);
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [continueWatchingId, setContinueWatchingId] = useState(null);
  
  const controlsTimeout = useRef(null);
  const progressInterval = useRef(null);
  
  const apiKey = '5f2eb573351003b912deaf3aa3f51ace';

  // Fetch movie data and user info
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch movie details
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.success === false) {
          throw new Error('Movie not found');
        }
        
        setMovie(data);
        
        // Get user data for progress tracking
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Get active profile
          const activeProfileId = localStorage.getItem('activeProfileId');
          
          if (activeProfileId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', activeProfileId)
              .single();
              
            setActiveProfile(profile);
            
            // Check if we have continue watching data
            if (profile) {
              const { data: continueWatchingData } = await supabase
                .from('continue_watching')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('movie_id', id)
                .single();
                
              if (continueWatchingData) {
                setContinueWatchingId(continueWatchingData.id);
                setProgress(continueWatchingData.progress || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Auto-hide controls after inactivity
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id]);

  // Set up progress tracking
  useEffect(() => {
    if (movie && activeProfile) {
      // Start tracking progress every 10 seconds
      progressInterval.current = setInterval(async () => {
        try {
          // Calculate estimated progress (this would be more accurate
          // if we could get the actual progress from the iframe, but that's not possible
          // with third-party embeds due to cross-origin restrictions)
          const newProgress = Math.min(progress + 1, 100);
          setProgress(newProgress);
          
          // Update progress in database
          if (continueWatchingId) {
            await supabase
              .from('continue_watching')
              .update({
                progress: newProgress,
                last_watched: new Date().toISOString()
              })
              .eq('id', continueWatchingId);
          } else {
            // Create new continue watching entry
            const { data } = await supabase
              .from('continue_watching')
              .insert({
                profile_id: activeProfile.id,
                movie_id: id,
                progress: newProgress,
                last_watched: new Date().toISOString(),
                movie_data: {
                  id,
                  title: movie.title,
                  poster_path: movie.poster_path,
                  backdrop_path: movie.backdrop_path,
                  release_date: movie.release_date,
                  vote_average: movie.vote_average
                }
              })
              .select();
              
            if (data?.[0]?.id) {
              setContinueWatchingId(data[0].id);
            }
          }
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }, 10000); // Update every 10 seconds
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [movie, activeProfile, continueWatchingId, progress, id]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Back to movie details
  const handleBack = () => {
    router.push(`/movie/${id}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">Error loading movie</div>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white">
      <Head>
        <title>Watching: {movie.title} | StreamVerse</title>
      </Head>

      <div 
        ref={playerRef}
        className="relative h-full w-full"
      >
        {/* Video Player Iframe */}
        <iframe 
          src={`https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          title={movie.title}
        ></iframe>
        
        {/* Custom Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 flex flex-col justify-between p-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back to details</span>
              </button>
              
              <div className="text-lg font-medium">{movie.title}</div>
            </div>
            
            {/* Bottom Bar */}
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="h-1 bg-gray-600 rounded overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div></div>
                
                {/* Right controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}