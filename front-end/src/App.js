import React, { useState, useEffect } from 'react';
import './App.css';
import Docs from './Docs';
import Chat from './Chat';

function App() {
  const [apiStatus, setApiStatus] = useState('loading');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL);
        if (!response.ok) throw new Error('API not available');
        setApiStatus('running');
      } catch (error) {
        setApiStatus('not running');
      }
    };

    checkApiStatus();
  }, []);

  return (
    <>
      <div className="row">
        <div className="container-fluid main">
          {apiStatus === 'loading' ? (
            <div className="text-center">Checking server status...</div>
          ) : apiStatus === 'not running' ? (
            <div className="text-center">Server is not running</div>
          ) : (
            <>
              <Docs />
              <Chat />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
