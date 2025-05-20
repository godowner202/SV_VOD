import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Navbar({ isScrolled = false, user = null, activeProfile = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-gray-900/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-500">Stream<span className="text-white">Verse</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`hover:text-purple-400 transition-colors ${router.pathname === '/' ? 'text-white font-medium' : 'text-gray-300'}`}>
              Home
            </Link>
            <Link href="/browse" className={`hover:text-purple-400 transition-colors ${router.pathname === '/browse' ? 'text-white font-medium' : 'text-gray-300'}`}>
              Browse
            </Link>
            <Link href="/search" className={`hover:text-purple-400 transition-colors ${router.pathname === '/search' ? 'text-white font-medium' : 'text-gray-300'}`}>
              Search
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Search Popup */}
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-md shadow-lg p-2">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies..."
                      className="flex-1 bg-gray-700 text-white rounded-l-md px-3 py-2 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* User Menu - Show when logged in */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                    {activeProfile?.avatar_url ? (
                      <img 
                        src={activeProfile.avatar_url} 
                        alt={activeProfile.name}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full p-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    {activeProfile && (
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium">{activeProfile.name}</p>
                      </div>
                    )}
                    
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                      Manage Profiles
                    </Link>
                    
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                      Account Settings
                    </Link>
                    
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login button when not logged in
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 rounded-md hover:bg-gray-800 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-3 space-y-1 border-t border-gray-700">
            <Link href="/" className="block py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Home
            </Link>
            <Link href="/browse" className="block py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Browse
            </Link>
            <Link href="/search" className="block py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Search
            </Link>
            {!user && (
              <Link href="/login" className="block py-2 px-3 text-purple-400 hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}