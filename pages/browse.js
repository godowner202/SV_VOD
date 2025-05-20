import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Browse() {
  const router = useRouter();
  const { genre: genreId } = router.query;
  
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentGenre, setCurrentGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const apiKey = '5f2eb573351003b912deaf3aa3f51ace';

  // Fetch list of genres when component mounts
  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`
        );
        const data = await response.json();
        
        if (data.genres) {
          setGenres(data.genres);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    }
    
    fetchGenres();
  }, []);

  // Fetch movies by genre when genreId changes or page changes
  useEffect(() => {
    if (!genreId && genres.length > 0) {
      // If no genre specified, redirect to first genre
      router.push(`/browse?genre=${genres[0].id}`);
      return;
    }
    
    if (!genreId) return;
    
    async function fetchMoviesByGenre() {
      setLoading(true);
      
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
        );
        const data = await response.json();
        
        if (data.results) {
          setMovies(data.results);
          setTotalPages(Math.min(data.total_pages, 500)); // TMDB API limits to 500 pages max
          
          // Set current genre name
          const genre = genres.find(g => g.id.toString() === genreId);
          if (genre) {
            setCurrentGenre(genre);
          }
        }
      } catch (error) {
        console.error('Error fetching movies by genre:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (genreId && genres.length > 0) {
      fetchMoviesByGenre();
    }
  }, [genreId, genres, page, router]);

  // Handle genre change
  const handleGenreChange = (id) => {
    setPage(1); // Reset to first page when genre changes
    router.push(`/browse?genre=${id}`);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top when page changes
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10">
      <Head>
        <title>
          {currentGenre ? `${currentGenre.name} Movies` : 'Browse Movies'} | StreamVerse
        </title>
      </Head>

      {/* Genre Navigation */}
      <div className="bg-gray-800 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex space-x-2 pb-1">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    genre.id.toString() === genreId
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        {currentGenre && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{currentGenre.name} Movies</h1>
            <p className="text-gray-400 mt-1">
              Browse all {currentGenre.name.toLowerCase()} movies
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-2xl">Loading...</div>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map(movie => (
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
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-10">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Previous
            </button>
            
            <div className="text-sm">
              Page <span className="font-bold">{page}</span> of{' '}
              <span className="font-bold">{totalPages}</span>
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded ${
                page === totalPages 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold">No movies found</h3>
            <p className="text-gray-400 mt-2">
              We couldn't find any movies for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}