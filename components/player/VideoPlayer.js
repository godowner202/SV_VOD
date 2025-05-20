import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function VideoPlayer({ 
  movieId, 
  onClose, 
  autoplay = true,
  startAt = 0,
  onProgress = () => {},
  miniPlayer = false 
}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controls, setControls] = useState({
    play: true,
    volume: 1,
    muted: false,
    showControls: true,
  });
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [progress, setProgress] = useState(startAt);
  const [continueWatchingId, setContinueWatchingId] = useState(null);
  
  const progressInterval = useRef(null);
  const controlsTimeout = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check for user and active profile
    async function checkUser() {
      try {
        // Get current user
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
            
            // Get continue watching data if available
            if (profile && movieId) {
              const { data: continueWatchingData } = await supabase
                .from('continue_watching')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('movie_id', movieId)
                .single();
                
              if (continueWatchingData) {
                setContinueWatchingId(continueWatchingData.id);
                // Only use database progress if we didn't specify a start time
                if (startAt === 0 && continueWatchingData.progress) {
                  setProgress(continueWatchingData.progress);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkUser();
    
    // Set up fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Auto-hide controls after inactivity
    const handleMouseMove = () => {
      setControls(prev => ({ ...prev, showControls: true }));
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = setTimeout(() => {
        setControls(prev => ({ ...prev, showControls: false }));
      }, 3000);
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [movieId, startAt]);

  // Set up progress tracking
  useEffect(() => {
    if (movieId && activeProfile && !loading) {
      // Start tracking progress every 10 seconds
      progressInterval.current = setInterval(async () => {
        try {
          // Simulate progress (actual progress would be more accurate if we could get it from iframe)
          const newProgress = Math.min(progress + 0.5, 100);
          setProgress(newProgress);
          onProgress(newProgress);
          
          // Save to database
          await updateProgress(newProgress);
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
  }, [movieId, activeProfile, progress, loading]);

  // Update progress in Supabase
  const updateProgress = async (newProgress) => {
    if (!user || !activeProfile || !movieId) return;
    
    try {
      if (continueWatchingId) {
        await supabase
          .from('continue_watching')
          .update({
            progress: newProgress,
            last_watched: new Date().toISOString()
          })
          .eq('id', continueWatchingId);
      } else {
        // Get movie data first
        const movieData = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=5f2eb573351003b912deaf3aa3f51ace`
        ).then(res => res.json());
        
        const { data } = await supabase
          .from('continue_watching')
          .upsert({
            profile_id: activeProfile.id,
            movie_id: movieId,
            progress: newProgress,
            last_watched: new Date().toISOString(),
            movie_data: {
              id: movieId,
              title: movieData.title,
              poster_path: movieData.poster_path,
              backdrop_path: movieData.backdrop_path,
              release_date: movieData.release_date,
              vote_average: movieData.vote_average
            }
          }, {
            onConflict: ['profile_id', 'movie_id']
          })
          .select();
          
        if (data?.[0]?.id) {
          setContinueWatchingId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error updating progress in database:', error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Toggle play/pause (note: this doesn't actually control the iframe player
  // due to cross-origin restrictions, but the UI will reflect the state)
  const togglePlay = () => {
    setControls(prev => ({ ...prev, play: !prev.play }));
  };

  // Toggle mute (note: same limitation as above)
  const toggleMute = () => {
    setControls(prev => ({ ...prev, muted: !prev.muted }));
  };
  
  // Mark movie as finished
  const markAsFinished = async () => {
    if (activeProfile && movieId) {
      try {
        await supabase
          .from('continue_watching')
          .update({
            progress: 100,
            completed: true,
            last_watched: new Date().toISOString()
          })
          .eq('profile_id', activeProfile.id)
          .eq('movie_id', movieId);
      } catch (error) {
        console.error('Error marking movie as finished:', error);
      }
    }
  };

  // Calculate appropriate URL with parameters
  const playerUrl = `https://multiembed.mov/directstream.php?video_id=${movieId}&tmdb=1${autoplay ? '&autoplay=1' : ''}`;
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black ${miniPlayer ? 'rounded-md overflow-hidden' : 'w-full h-full'}`}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Loading player...</div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-white text-xl mb-3">Error loading movie</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={onClose || (() => router.back())}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Iframe Player */}
          <iframe
            ref={playerRef}
            src={playerUrl}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            title="Movie Player"
          ></iframe>
          
          {/* Custom Controls Overlay - Only show when showControls is true */}
          {controls.showControls && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 flex flex-col justify-between p-2 md:p-4 opacity-0 hover:opacity-100 transition-opacity">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                {/* Title - Only on non-mini player */}
                {!miniPlayer && (
                  <div className="text-white font-medium truncate max-w-[50%] hidden md:block">
                    Now playing
                  </div>
                )}
                
                {/* Top Right Controls */}
                <div className="ml-auto">
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Close player"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="space-y-2">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center space-x-3">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={controls.play ? "Pause" : "Play"}
                    >
                      {controls.play ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Volume/Mute Button */}
                    <button
                      onClick={toggleMute}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={controls.muted ? "Unmute" : "Mute"}
                    >
                      {controls.muted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                          <path d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" fillOpacity="0" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Progress Percentage - Hide on small screens */}
                    <span className="text-white text-sm hidden md:inline">
                      {progress.toFixed(0)}% complete
                    </span>
                  </div>
                  
                  {/* Right Controls */}
                  <div className="flex items-center space-x-3">
                    {/* Mark as Finished - Hide on small screens */}
                    <button
                      onClick={markAsFinished}
                      className="text-white text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors hidden md:block"
                    >
                      Mark as Finished
                    </button>
                    
                    {/* Fullscreen Toggle */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4a1 1 0 01-2 0V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 8a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h4v-4a1 1 0 011-1zM5 12H1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0v-3zm12-6a1 1 0 01-1 1h-4a1 1 0 010-2h4a1 1 0 011 1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}