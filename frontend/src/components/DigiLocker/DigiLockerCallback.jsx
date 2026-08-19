import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';

const DigiLockerCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      // Simulate API verification
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          // Go back to the main flow, probably passing some state
          navigate('/', { state: { digilockerSuccess: true } });
        }, 1500);
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {status === 'processing' && (
        <>
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Verifying with DigiLocker...</p>
        </>
      )}
      {status === 'success' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900">Verification Successful!</p>
          <p className="mt-2 text-gray-500">Redirecting back to application...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-red-500 font-medium">Verification failed or cancelled.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-primary underline"
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default DigiLockerCallback;
