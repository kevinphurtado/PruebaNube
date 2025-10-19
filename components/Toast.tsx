import React from 'react';
import { CloseIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 transition-opacity duration-300";
  
  const typeStyles = {
    success: {
      container: "dark:bg-green-800/20",
      iconContainer: "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200",
      iconPath: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
    },
    error: {
      container: "dark:bg-red-800/20",
      iconContainer: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
      iconPath: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`${baseClasses} ${styles.container}`} role="alert">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${styles.iconContainer} rounded-lg`}>
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd"></path>
        </svg>
        <span className="sr-only">{type === 'success' ? 'Success icon' : 'Error icon'}</span>
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <CloseIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
