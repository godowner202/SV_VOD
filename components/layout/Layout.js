import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase } from '../../lib/supabase';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is authenticated and get active profile
  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Check for active profile
          const activeProfileId = localStorage.getItem('activeProfileId');
          
          if (activeProfileId) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', activeProfileId)
                .single();
                
              if (profile) {
                setActiveProfile(profile);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }
        } else {
          setUser(null);
          setActiveProfile(null);
        }
      }
    );

    // Initial check
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get active profile
        const activeProfileId = localStorage.getItem('activeProfileId');
        
        if (activeProfileId) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', activeProfileId)
              .single();
              
            if (profile) {
              setActiveProfile(profile);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      }
    }
    
    checkUser();

    // Clean up subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Listen for scroll to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar 
        isScrolled={isScrolled} 
        user={user} 
        activeProfile={activeProfile} 
      />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}