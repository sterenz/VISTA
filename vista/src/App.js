import React, { useState } from "react";
import Header from "./components/Header";
import MiradorViewer from "./MiradorViewer";
import AnnotationGraph from "./components/AnnotationGraph";
import BottomNavigation from "./components/BottomNavigation";
import ManageAnnotations from "./components/ManageAnnotations";

function App() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="px-6 bg-vista-white">
      <Header />
      {activeTab === 1 && <MiradorViewer />}
      {activeTab === 2 && <ManageAnnotations />}
      {activeTab === 3 && <AnnotationGraph />}

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
