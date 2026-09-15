import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './Home';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Logo } from './components/Logo';


const App: React.FC = () => {
  return (
    <div className="App">
      <header>
        <Logo />
        <ConnectButton />

      </header>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;