import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [availableAvatars, setAvailableAvatars] = useState([]);

  // Check if user is authenticated and fetch profiles
  useEffect(() => {
    async function checkUser() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push('/login?redirectTo=/profile');
          return;
        }
        
        setUser(user);
        
        // Fetch user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);
        
        if (profilesError) throw profilesError;
        
        setProfiles(profilesData || []);

        // Fetch available avatars
        const { data: avatarsData, error: avatarsError } = await supabase
          .from('profile_avatars')
          .select('*')
          .eq('is_active', true);
        
        if (avatarsError) throw avatarsError;
        
        setAvailableAvatars(avatarsData || []);
        
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkUser();
  }, [router]);

  // Handle profile selection
  const selectProfile = (profileId) => {
    // Set active profile in localStorage (this would be better with context/state management)
    localStorage.setItem('activeProfileId', profileId);
    router.push('/');
  }
  
  // Handle add profile
  const addProfile = () => {
    router.push('/profile/create');
  }
  
  // Handle edit profile
  const editProfile = (profileId) => {
    router.push(`/profile/edit?id=${profileId}`);
  }

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Who's Watching? | StreamVerse</title>
      </Head>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Who's watching?</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {/* Profile Cards */}
          {profiles.map(profile => (
            <div key={profile.id} className="flex flex-col items-center w-32">
              <button 
                onClick={() => selectProfile(profile.id)} 
                className="w-32 h-32 rounded-md overflow-hidden mb-3 hover:ring-4 hover:ring-white focus:outline-none transition-all"
              >
                {/* Profile Avatar */}
                <img 
                  src={profile.avatar_url || '/images/avatars/default.png'} 
                  alt={profile.name}
                  className="w-full h-full object-cover" 
                />
              </button>
              <h3 className="text-lg">{profile.name}</h3>
              <button 
                onClick={() => editProfile(profile.id)}
                className="mt-2 text-gray-400 hover:text-white text-sm"
              >
                Edit
              </button>
            </div>
          ))}

          {/* Add Profile Button (limit to 5 profiles) */}
          {profiles.length < 5 && (
            <div className="flex flex-col items-center w-32">
              <button 
                onClick={addProfile}
                className="w-32 h-32 rounded-md bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-white hover:bg-gray-700 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg mt-3">Add Profile</h3>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="text-center mt-16">
          <button 
            onClick={handleSignOut}
            className="bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-white px-6 py-2 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}