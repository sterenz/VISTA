import React, { useState } from "react";
import Header from "./components/Header";
import MiradorViewer from "./MiradorViewer";
import ScatterPlot from "./components/ScatterPlot";
import AnnotationGraph from "./components/AnnotationGraph";
import BottomNavigation from "./components/BottomNavigation";

function App() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="px-6 bg-vista-white">
      <Header />
      {activeTab === 1 && <MiradorViewer />}
      {activeTab === 2 && <ScatterPlot />}
      {activeTab === 3 && <AnnotationGraph />}

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
