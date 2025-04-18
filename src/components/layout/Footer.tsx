import React from 'react';

/**
 * Simple application footer
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>GrailTube - Discover rare YouTube videos sorted by view count</p>
      </div>
    </footer>
  );
};

export default Footer;