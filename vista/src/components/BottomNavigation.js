import React from "react";

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="w-full bg-vista-white-dark fixed bottom-0 left-0 right-0 items-center mx-auto text-vista-text z-[2000]">
      <div className="flex border-y border-vista-gray">
        <button
          onClick={() => setActiveTab(1)}
          className={`hover:bg-vista-white flex-1 py-4 text-center  ${
            activeTab === 1 ? "active bg-vista-white" : ""
          }`}
        >
          Create Annotations
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`hover:bg-vista-white flex-1 py-4 text-center border-x border-vista-gray ${
            activeTab === 2 ? "active bg-vista-white" : ""
          }`}
        >
          Manage Annotations
        </button>
        <button
          onClick={() => setActiveTab(3)}
          className={`hover:bg-vista-white flex-1 py-4 text-center ${
            activeTab === 3 ? "active bg-vista-white" : ""
          }`}
        >
          Visualize Annotations
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
