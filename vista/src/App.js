import React from "react";
import MiradorViewer from "./MiradorViewer";
import ScatterPlot from "./components/ScatterPlot";
import AnnotationGraph from "./components/AnnotationGraph";

function App() {
  return (
    <div className="App">
      <h1 className="logo">vista</h1>
      <MiradorViewer />
      <ScatterPlot />
      <AnnotationGraph />
    </div>
  );
}

export default App;
