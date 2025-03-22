import React, { useState } from "react";
import MiradorViewer from "./MiradorViewer";
import ScatterPlot from "./components/ScatterPlot";
import AnnotationGraph from "./components/AnnotationGraph";
import BottomNavigation from "./components/BottomNavigation";

function App() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="App bg-vista-white">
      <h1 className="logo text-2xl font-bold">vista</h1>
      {activeTab === 1 && <MiradorViewer />}
      {activeTab === 2 && <ScatterPlot />}
      {activeTab === 3 && <AnnotationGraph />}

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
