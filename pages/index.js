import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        // TMDB API key
        const apiKey = '5f2eb573351003b912deaf3aa3f51ace';
        
        // Fetch trending movies for featured content
        const trendingResponse = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`
        );
        const trendingData = await trendingResponse.json();
        
        if (trendingData.results?.length > 0) {
          // Use first trending movie as featured
          const featured = trendingData.results[0];
          // Fetch full details of featured movie
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${featured.id}?api_key=${apiKey}&append_to_response=videos`
          );
          const detailedFeatured = await detailsResponse.json();
          setFeaturedMovie(detailedFeatured);
        }
        
        // Fetch popular movies
        const popularResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
        );
        const popularData = await popularResponse.json();
        setPopularMovies(popularData.results || []);
        
        // Use trending weekly for trending section
        const trendingWeeklyResponse = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
        );
        const trendingWeeklyData = await trendingWeeklyResponse.json();
        setTrendingMovies(trendingWeeklyData.results || []);
        
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>StreamVerse - Watch Movies Online</title>
        <meta name="description" content="Watch your favorite movies online with StreamVerse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Featured Movie Banner */}
      {featuredMovie && (
        <div className="relative h-[70vh] min-h-[500px]">
          {/* Backdrop Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})` 
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
          </div>

          {/* Featured Content */}
          <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 flex flex-col justify-end h-full">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredMovie.title}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <span>{new Date(featuredMovie.release_date).getFullYear()}</span>
              <span className="bg-purple-600 px-2 py-1 rounded text-sm">
                {featuredMovie.vote_average.toFixed(1)}/10
              </span>
              {featuredMovie.runtime && (
                <span>{Math.floor(featuredMovie.runtime / 60)}h {featuredMovie.runtime % 60}m</span>
              )}
            </div>
            
            <p className="text-gray-300 mb-6 max-w-xl line-clamp-3 md:line-clamp-4">
              {featuredMovie.overview}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href={`/player/${featuredMovie.id}`} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md font-semibold flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Now
              </Link>
              <Link href={`/movie/${featuredMovie.id}`} className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-md font-semibold transition-colors">
                More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Popular Movies Section */}
      <section className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Popular Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {popularMovies.slice(0, 12).map(movie => (
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
      </section>

      {/* Trending Movies Section */}
      <section className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {trendingMovies.slice(0, 12).map(movie => (
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
      </section>
    </div>
  );
}