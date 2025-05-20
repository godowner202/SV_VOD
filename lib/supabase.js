import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a new user profile
 * @param {string} user_id - The user's ID from Supabase Auth
 * @param {object} profileData - Profile data like name, avatar_url
 * @returns {Promise} - Supabase response
 */
export const createProfile = async (user_id, profileData) => {
  return await supabase
    .from('profiles')
    .insert({
      user_id,
      ...profileData,
      created_at: new Date().toISOString(),
    });
};

/**
 * Get all profiles for a user
 * @param {string} user_id - The user's ID from Supabase Auth
 * @returns {Promise} - Profiles array
 */
export const getUserProfiles = async (user_id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

/**
 * Update a user profile
 * @param {string} profile_id - The profile ID to update
 * @param {object} updates - Object containing profile updates
 * @returns {Promise} - Supabase response
 */
export const updateProfile = async (profile_id, updates) => {
  return await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile_id);
};

/**
 * Delete a user profile
 * @param {string} profile_id - The profile ID to delete
 * @returns {Promise} - Supabase response
 */
export const deleteProfile = async (profile_id) => {
  // First delete related data
  await supabase
    .from('watchlist')
    .delete()
    .eq('profile_id', profile_id);
    
  await supabase
    .from('continue_watching')
    .delete()
    .eq('profile_id', profile_id);
    
  // Then delete the profile
  return await supabase
    .from('profiles')
    .delete()
    .eq('id', profile_id);
};

/**
 * Add a movie to watchlist
 * @param {string} profile_id - The profile ID
 * @param {object} movie - Movie data to add to watchlist
 * @returns {Promise} - Supabase response
 */
export const addToWatchlist = async (profile_id, movie) => {
  return await supabase
    .from('watchlist')
    .upsert({
      profile_id,
      movie_id: movie.id,
      movie_data: {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average
      },
      added_at: new Date().toISOString()
    }, {
      onConflict: ['profile_id', 'movie_id']
    });
};

/**
 * Remove a movie from watchlist
 * @param {string} profile_id - The profile ID
 * @param {string|number} movie_id - The movie ID
 * @returns {Promise} - Supabase response
 */
export const removeFromWatchlist = async (profile_id, movie_id) => {
  return await supabase
    .from('watchlist')
    .delete()
    .eq('profile_id', profile_id)
    .eq('movie_id', movie_id);
};

/**
 * Get a user's watchlist
 * @param {string} profile_id - The profile ID
 * @returns {Promise} - Watchlist array
 */
export const getWatchlist = async (profile_id) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('profile_id', profile_id)
    .order('added_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

/**
 * Update continue watching entry
 * @param {string} profile_id - The profile ID
 * @param {object} movie - Movie data
 * @param {number} progress - Watching progress (0-100)
 * @returns {Promise} - Supabase response
 */
export const updateContinueWatching = async (profile_id, movie, progress) => {
  return await supabase
    .from('continue_watching')
    .upsert({
      profile_id,
      movie_id: movie.id,
      movie_data: {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average
      },
      progress,
      last_watched: new Date().toISOString()
    }, {
      onConflict: ['profile_id', 'movie_id']
    });
};

/**
 * Get continue watching list
 * @param {string} profile_id - The profile ID
 * @returns {Promise} - Continue watching array
 */
export const getContinueWatching = async (profile_id) => {
  const { data, error } = await supabase
    .from('continue_watching')
    .select('*')
    .eq('profile_id', profile_id)
    .order('last_watched', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

/**
 * Remove from continue watching
 * @param {string} profile_id - The profile ID
 * @param {string|number} movie_id - The movie ID
 * @returns {Promise} - Supabase response
 */
export const removeFromContinueWatching = async (profile_id, movie_id) => {
  return await supabase
    .from('continue_watching')
    .delete()
    .eq('profile_id', profile_id)
    .eq('movie_id', movie_id);
};