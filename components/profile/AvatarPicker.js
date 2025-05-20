import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AvatarPicker({ value = null, onChange, showKidsAvatars = false }) {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(value);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Define avatar categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'characters', name: 'Characters' },
    { id: 'animals', name: 'Animals' },
    { id: 'abstract', name: 'Abstract' }
  ];

  // Load avatars from Supabase or fall back to static list
  useEffect(() => {
    async function fetchAvatars() {
      setLoading(true);
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('profile_avatars')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAvatars(data.filter(avatar => showKidsAvatars ? true : !avatar.kids_only));
        } else {
          // Fallback to static list if no avatars in database
          setAvatars(getDefaultAvatars());
        }
      } catch (error) {
        console.error('Error loading avatars:', error);
        setError('Failed to load avatars');
        setAvatars(getDefaultAvatars());
      } finally {
        setLoading(false);
      }
    }

    fetchAvatars();
  }, [showKidsAvatars]);
  
  // Set initial selected avatar if provided
  useEffect(() => {
    if (value) {
      setSelectedAvatar(value);
    }
  }, [value]);

  // Default avatars as fallback
  const getDefaultAvatars = () => {
    const defaultAvatars = [
      { id: '1', url: '/images/avatars/avatar1.png', category: 'characters', kids_only: false },
      { id: '2', url: '/images/avatars/avatar2.png', category: 'characters', kids_only: false },
      { id: '3', url: '/images/avatars/avatar3.png', category: 'animals', kids_only: false },
      { id: '4', url: '/images/avatars/avatar4.png', category: 'animals', kids_only: false },
      { id: '5', url: '/images/avatars/avatar5.png', category: 'abstract', kids_only: false },
      { id: '6', url: '/images/avatars/kids1.png', category: 'characters', kids_only: true },
      { id: '7', url: '/images/avatars/kids2.png', category: 'animals', kids_only: true },
    ];
    
    return showKidsAvatars 
      ? defaultAvatars 
      : defaultAvatars.filter(avatar => !avatar.kids_only);
  };

  // Filter avatars based on search and tab
  const filteredAvatars = avatars.filter(avatar => {
    // Filter by search term if it exists
    const matchesSearch = searchTerm === '' || 
      avatar.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by active tab
    const matchesTab = activeTab === 'all' || avatar.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Handle avatar selection
  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar.url);
    if (onChange) {
      onChange(avatar.url);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-400">Loading avatars...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search avatars..."
            className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide space-x-2 mb-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
              activeTab === category.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Avatar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {filteredAvatars.map(avatar => (
          <button
            key={avatar.id}
            onClick={() => handleSelectAvatar(avatar)}
            className={`w-full aspect-square rounded-md overflow-hidden border-2 ${
              selectedAvatar === avatar.url 
                ? 'border-purple-500 ring-2 ring-purple-500' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img 
              src={avatar.url} 
              alt={avatar.name || `Avatar ${avatar.id}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
        
        {filteredAvatars.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No avatars found</p>
          </div>
        )}
      </div>
    </div>
  );
}