import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Search() {
  const router = useRouter();
  const { query } = router.query;

  const [searchTerm, setSearchTerm] = useState(query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const apiKey = '5f2eb573351003b912deaf3aa3f51ace';

  // Handle search form submission
  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}&page=1`);
    }
  };

  // Fetch search results when query changes
  useEffect(() => {
    if (!query) return;

    setSearchTerm(query);
    setLoading(true);

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=${page || 1}&include_adult=false`
        );
        const data = await response.json();
        
        if (data.results) {
          setResults(data.results);
          setTotalResults(data.total_results);
          setTotalPages(Math.min(data.total_pages, 500));
        }
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/search?query=${encodeURIComponent(query)}&page=${newPage}`);
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10">
      <Head>
        <title>
          {query ? `Search Results: ${query}` : 'Search Movies'} | StreamVerse
        </title>
      </Head>

      {/* Search Form */}
      <div className="bg-gray-800 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for movies..."
              className="flex-1 bg-gray-700 text-white rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Area */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        {query && !loading && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Search Results: "{query}"</h1>
            <p className="text-gray-400 mt-1">
              Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-2xl">Searching...</div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map(movie => (
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
              onClick={() => handlePageChange(parseInt(page || 1) - 1)}
              disabled={parseInt(page || 1) === 1}
              className={`px-4 py-2 rounded ${
                parseInt(page || 1) === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Previous
            </button>
            
            <div className="text-sm">
              Page <span className="font-bold">{page || 1}</span> of{' '}
              <span className="font-bold">{totalPages}</span>
            </div>
            
            <button
              onClick={() => handlePageChange(parseInt(page || 1) + 1)}
              disabled={parseInt(page || 1) === totalPages}
              className={`px-4 py-2 rounded ${
                parseInt(page || 1) === totalPages 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold">No results found</h3>
            <p className="text-gray-400 mt-2">
              We couldn't find any movies matching "{query}".
            </p>
            <div className="mt-6">
              <p className="mb-2">Try:</p>
              <ul className="text-gray-400">
                <li>• Checking your spelling</li>
                <li>• Using fewer or different keywords</li>
                <li>• Searching for a more general term</li>
              </ul>
            </div>
          </div>
        )}

        {/* Default State - No Query */}
        {!query && !loading && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold">Search for Movies</h3>
            <p className="text-gray-400 mt-2">
              Enter a movie title in the search box to find your next watch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}