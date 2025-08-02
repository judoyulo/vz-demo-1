import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const buttonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '18px',
  margin: '0 5px',
  transition: 'all 0.2s ease',
};

const textButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  width: 'auto',
  borderRadius: '20px',
  padding: '0 15px',
  fontSize: '14px',
  fontWeight: '600',
};

export default function GlobalNav() {
  const router = useRouter();
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setCanGoForward(window.history.state && window.history.state.idx < window.history.length - 1);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    handleRouteChange(); 

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <button 
        onClick={() => router.back()}
        style={buttonStyle}
        title="Go Back"
      >
        <span>←</span>
      </button>
      {canGoForward && (
        <button 
          onClick={() => router.forward()}
          style={buttonStyle}
          title="Go Forward"
        >
          <span>→</span>
        </button>
      )}
      <button 
        onClick={() => router.push('/')}
        style={textButtonStyle}
        title="Restart"
      >
        <span>Restart</span>
      </button>
    </div>
  );
}