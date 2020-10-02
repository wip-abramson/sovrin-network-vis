import React from 'react';
import logo from './logo.svg';
import './App.css';
import NetworkVisualisation from "./NetworkVisualisation";

function App() {
  return (
    <div className="App">
        <h1>Visualisation of Sovrin Network Transactions</h1>
        <NetworkVisualisation/>
    </div>
  );
}

export default App;
