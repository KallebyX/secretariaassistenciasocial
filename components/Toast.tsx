import React from 'react';
import { useToastState } from '../context/ToastContext';

const typeClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const typeIcons = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastState();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`${typeClasses[type]} text-white py-3 px-5 rounded-lg shadow-xl flex items-center space-x-3 animate-slide-in`}
        >
          {typeIcons[type]}
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
};
