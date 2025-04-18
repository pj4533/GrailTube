import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLoginModal from '@/components/AdminLoginModal';

/**
 * Simple application footer
 */
const Footer: React.FC = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { isAdmin, logout } = useAdmin();
  
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center text-sm">
        {/* Admin button on the left */}
        <button
          onClick={isAdmin ? logout : () => setShowAdminModal(true)}
          className={`p-2 rounded ${isAdmin 
            ? 'text-emerald-400' 
            : 'text-gray-500 hover:text-gray-300'}`}
          data-testid="admin-button"
          aria-label="Admin Access"
        >
          <Icon.Lock className="h-4 w-4" />
        </button>
        
        {/* Center text */}
        <p>GrailTube - Discover unedited YouTube videos sorted by view count</p>
        
        {/* Empty div for alignment */}
        <div className="w-4" />
        
        {/* Admin Login Modal */}
        {showAdminModal && (
          <AdminLoginModal onClose={() => setShowAdminModal(false)} />
        )}
      </div>
    </footer>
  );
};

export default Footer;