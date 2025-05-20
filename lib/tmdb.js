// TMDB API wrapper for StreamVerse

// API constants
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '5f2eb573351003b912deaf3aa3f51ace';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Core fetch function for TMDB API
 * @param {string} endpoint - API endpoint
 * @param {object} params - URL parameters
 * @returns {Promise} - JSON response
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add API key to parameters
  url.searchParams.append('api_key', API_KEY);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
};

/**
 * Get image URL from path
 * @param {string} path - Image path
 * @param {string} size - Image size (w500, original, etc.)
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Get trending movies
 * @param {string} timeWindow - 'day' or 'week'
 * @param {number} page - Page number
 * @returns {Promise} - List of trending movies
 */
export const getTrendingMovies = async (timeWindow = 'day', page = 1) => {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`, { page });
};

/**
 * Get popular movies
 * @param {number} page - Page number
 * @returns {Promise} - List of popular movies
 */
export const getPopularMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/popular', { page });
};

/**
 * Get top rated movies
 * @param {number} page - Page number
 * @returns {Promise} - List of top rated movies
 */
export const getTopRatedMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/top_rated', { page });
};

/**
 * Get movie details
 * @param {string|number} id - Movie ID
 * @param {array} appendToResponse - Additional data to append (videos, credits, etc.)
 * @returns {Promise} - Movie details
 */
export const getMovieDetails = async (id, appendToResponse = []) => {
  const params = {};
  if (appendToResponse.length > 0) {
    params.append_to_response = appendToResponse.join(',');
  }
  return fetchFromTMDB(`/movie/${id}`, params);
};

/**
 * Get movie videos (trailers, etc.)
 * @param {string|number} id - Movie ID
 * @returns {Promise} - Movie videos
 */
export const getMovieVideos = async (id) => {
  return fetchFromTMDB(`/movie/${id}/videos`);
};

/**
 * Get movie credits (cast & crew)
 * @param {string|number} id - Movie ID
 * @returns {Promise} - Movie credits
 */
export const getMovieCredits = async (id) => {
  return fetchFromTMDB(`/movie/${id}/credits`);
};

/**
 * Get similar movies
 * @param {string|number} id - Movie ID
 * @param {number} page - Page number
 * @returns {Promise} - Similar movies
 */
export const getSimilarMovies = async (id, page = 1) => {
  return fetchFromTMDB(`/movie/${id}/similar`, { page });
};

/**
 * Search movies
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {boolean} includeAdult - Include adult content
 * @returns {Promise} - Search results
 */
export const searchMovies = async (query, page = 1, includeAdult = false) => {
  return fetchFromTMDB('/search/movie', { 
    query, 
    page,
    include_adult: includeAdult
  });
};

/**
 * Get movie recommendations
 * @param {string|number} id - Movie ID
 * @param {number} page - Page number
 * @returns {Promise} - Recommended movies
 */
export const getMovieRecommendations = async (id, page = 1) => {
  return fetchFromTMDB(`/movie/${id}/recommendations`, { page });
};

/**
 * Discover movies by genre
 * @param {string|number|array} genreIds - Genre ID(s)
 * @param {number} page - Page number
 * @param {string} sortBy - Sort method (popularity.desc, etc.)
 * @returns {Promise} - Movies in genre
 */
export const discoverMoviesByGenre = async (genreIds, page = 1, sortBy = 'popularity.desc') => {
  const genreParam = Array.isArray(genreIds) ? genreIds.join(',') : genreIds;
  
  return fetchFromTMDB('/discover/movie', {
    with_genres: genreParam,
    page,
    sort_by: sortBy
  });
};

/**
 * Get movie genres list
 * @returns {Promise} - List of genres
 */
export const getMovieGenres = async () => {
  return fetchFromTMDB('/genre/movie/list');
};

/**
 * Get movies by year
 * @param {number} year - Release year
 * @param {number} page - Page number
 * @returns {Promise} - Movies from that year
 */
export const getMoviesByYear = async (year, page = 1) => {
  return fetchFromTMDB('/discover/movie', {
    primary_release_year: year,
    page
  });
};

/**
 * Get now playing movies in theaters
 * @param {number} page - Page number
 * @returns {Promise} - Now playing movies
 */
export const getNowPlayingMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/now_playing', { page });
};

/**
 * Get upcoming movies
 * @param {number} page - Page number
 * @returns {Promise} - Upcoming movies
 */
export const getUpcomingMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/upcoming', { page });
};