import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function MovieDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  
  const apiKey = '5f2eb573351003b912deaf3aa3f51ace';

  // Fetch movie details and user data
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch movie details with credits, videos, and similar movies
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos,similar`
        );
        const movieData = await detailsResponse.json();
        
        if (movieData.success === false) {
          // Movie not found
          router.push('/404');
          return;
        }
        
        setMovie(movieData);
        setSimilarMovies(movieData.similar?.results || []);
        
        // Check if user is logged in
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
            
            // Check if movie is in watchlist
            if (profile) {
              const { data: watchlistItem } = await supabase
                .from('watchlist')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('movie_id', id)
                .single();
                
              setInWatchlist(!!watchlistItem);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, router]);

  // Toggle watchlist status
  const toggleWatchlist = async () => {
    if (!user || !activeProfile) {
      router.push('/login?redirectTo=' + router.asPath);
      return;
    }
    
    try {
      if (inWatchlist) {
        // Remove from watchlist
        await supabase
          .from('watchlist')
          .delete()
          .eq('profile_id', activeProfile.id)
          .eq('movie_id', id);
      } else {
        // Add to watchlist
        await supabase
          .from('watchlist')
          .insert({
            profile_id: activeProfile.id,
            movie_id: id,
            movie_data: {
              id,
              title: movie.title,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average
            }
          });
      }
      
      // Update state
      setInWatchlist(!inWatchlist);
      
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  // Handle watch button click
  const handleWatch = async () => {
    // If user is authenticated, save to continue watching
    if (user && activeProfile) {
      try {
        await supabase
          .from('continue_watching')
          .upsert({
            profile_id: activeProfile.id,
            movie_id: id,
            movie_data: {
              id,
              title: movie.title,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average
            },
            progress: 0,
            last_watched: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving to continue watching:', error);
      }
    }
    
    router.push(`/player/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading movie details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Movie not found</div>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const directors = movie.credits?.crew?.filter(
    person => person.job === 'Director'
  ) || [];
  
  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <Head>
        <title>{movie.title} | StreamVerse</title>
        <meta name="description" content={movie.overview || `Watch ${movie.title} on StreamVerse`} />
      </Head>

      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] min-h-[500px]">
        {/* Backdrop Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>

        {/* Movie Content */}
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
            {movie.adult && (
              <span className="border border-red-500 text-red-500 px-2 py-0.5 rounded text-sm">
                18+
              </span>
            )}
          </div>
          
          <p className="text-gray-300 mb-6 max-w-xl">
            {movie.overview}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleWatch}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md font-semibold flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Now
            </button>
            
            <button 
              onClick={toggleWatchlist}
              className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-md font-semibold transition-colors flex items-center"
            >
              {inWatchlist ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  In Watchlist
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add to Watchlist
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Trailer */}
            {trailer && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                <div className="relative pb-[56.25%] h-0">
                  <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${movie.title} trailer`}
                  ></iframe>
                </div>
              </div>
            )}
            
            {/* Cast & Crew */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
              
              {/* Directors */}
              {directors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Director{directors.length > 1 ? 's' : ''}</h3>
                  <div className="flex flex-wrap gap-2">
                    {directors.map(director => (
                      <span key={director.id} className="bg-gray-800 px-3 py-1 rounded-full">
                        {director.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {cast.map(person => (
                      <div key={person.id} className="bg-gray-800 p-2 rounded-md text-center">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                            alt={person.name}
                            className="w-full h-40 object-cover object-top rounded mb-2" 
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <h4 className="font-medium text-sm">{person.name}</h4>
                        <p className="text-xs text-gray-400">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Info */}
          <div>
            {/* Movie Poster */}
            <div className="mb-6 hidden lg:block">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg" 
              />
            </div>
            
            {/* Movie Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Movie Info</h3>
              
              <div className="space-y-3">
                {movie.release_date && (
                  <div>
                    <span className="text-gray-400">Release Date:</span>
                    <span className="block">{new Date(movie.release_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {movie.genres?.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {movie.genres.map(genre => (
                        <Link 
                          key={genre.id}
                          href={`/browse?genre=${genre.id}`}
                          className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {movie.production_countries?.length > 0 && (
                  <div>
                    <span className="text-gray-400">Country:</span>
                    <span className="block">
                      {movie.production_countries.map(c => c.name).join(', ')}
                    </span>
                  </div>
                )}
                
                {movie.spoken_languages?.length > 0 && (
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="block">
                      {movie.spoken_languages.map(l => l.english_name).join(', ')}
                    </span>
                  </div>
                )}
                
                {movie.budget > 0 && (
                  <div>
                    <span className="text-gray-400">Budget:</span>
                    <span className="block">
                      ${movie.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {movie.revenue > 0 && (
                  <div>
                    <span className="text-gray-400">Revenue:</span>
                    <span className="block">
                      ${movie.revenue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.slice(0, 6).map(movie => (
                <Link href={`/movie/${movie.id}`} key={movie.id} className="block group">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-800">
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center">
                        {movie.title}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-4 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="font-semibold text-sm">{movie.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-300">{movie.release_date?.split('-')[0]}</span>
                        <span className="bg-purple-600 px-1.5 py-0.5 rounded text-xs">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}