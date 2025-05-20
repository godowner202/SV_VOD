import { useState } from 'react';

export default function ProfileCard({
  profile,
  onSelect,
  onEdit,
  isCreateCard = false,
  isCurrentUser = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle selection of profile
  const handleClick = () => {
    if (onSelect) {
      onSelect(profile);
    }
  };

  // Handle edit button click
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (onEdit) {
      onEdit(profile);
    }
  };

  // Create new profile card
  if (isCreateCard) {
    return (
      <div className="flex flex-col items-center">
        <button 
          onClick={handleClick}
          className="w-32 h-32 rounded-md bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-white hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg mt-3 text-center">Add Profile</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Profile Avatar Button */}
        <button 
          onClick={handleClick}
          className={`w-32 h-32 rounded-md overflow-hidden focus:outline-none ${isCurrentUser ? 'ring-4 ring-purple-500' : 'hover:ring-4 hover:ring-white focus:ring-2 focus:ring-purple-500'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-full h-full overflow-hidden">
            <img 
              src={profile.avatar_url || '/images/avatars/default.png'} 
              alt={profile.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
        
        {/* Edit Button - Absolute positioned on the avatar */}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-1 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Edit profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Profile Name */}
      <h3 className={`text-lg mt-4 text-center ${isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
        {profile.name}
      </h3>
      
      {/* Kids Profile Badge */}
      {profile.is_kids && (
        <span className="mt-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
          Kids
        </span>
      )}
    </div>
  );
}