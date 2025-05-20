import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="mb-4">
            <span className="text-xl font-bold text-purple-500">Stream<span className="text-white">Verse</span></span>
          </Link>
          
          <p className="text-gray-400 font-medium text-lg mb-2">Made By GhostHax</p>
          
          <p className="text-sm text-gray-500">
            &copy; {currentYear} StreamVerse. All rights reserved. Powered by Superembed.stream
          </p>
        </div>
      </div>
    </footer>
  );
}