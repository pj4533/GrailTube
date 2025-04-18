import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from '@/lib/styles';

interface AdminLoginModalProps {
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await login(password);
      if (success) {
        onClose();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Admin Login</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <Icon.Close />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.form.input + ' w-full'}
              placeholder="Enter admin password"
              autoFocus
              required
              disabled={isSubmitting}
            />
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              type="button" 
              variant="secondary"
              size="sm"
              className="mr-3"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              size="sm"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;