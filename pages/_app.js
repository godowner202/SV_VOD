import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Layout from '../components/layout/Layout';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();
  
  // Check which pages should not use the layout
  const noLayoutPages = ['/login', '/profile', '/player/[id]'];
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);

  // Add analytics or other global functionality here
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Analytics tracking would go here
      console.log(`App navigated to: ${url}`);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      {shouldUseLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
      <Analytics />
    </SessionContextProvider>
  );
}
