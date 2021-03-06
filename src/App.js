import React from 'react';
import './App.css';
import '../node_modules/bulma/css/bulma.css'

import NetworkVisualisation from "./NetworkVisualisation";

function App() {
  return (
    <div className="App">
        <h1 className="title">Visualisation of Sovrin Network Transactions</h1>
        <NetworkVisualisation/>
    </div>
  );
}

export default App;
