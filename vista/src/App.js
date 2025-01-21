import React from "react";
import MiradorViewer from "./MiradorViewer";
import ScatterPlot from "./components/ScatterPlot";

function App() {
  return (
    <div className="App">
      <h1>My Mirador App</h1>
      <MiradorViewer />
      <ScatterPlot />
    </div>
  );
}

export default App;
