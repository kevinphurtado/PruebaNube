import React from 'react';

const LoadingSpinner: React.FC<{ text?: string; fullScreen?: boolean }> = ({ text, fullScreen = false }) => {
    const wrapperClasses = fullScreen
        ? "flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900"
        : "flex items-center justify-center h-full";
    
    return (
        <div className={wrapperClasses}>
            <div className="text-center">
                <div 
                    role="status"
                    aria-label="Cargando"
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin mx-auto"
                >
                </div>
                {text && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{text}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;