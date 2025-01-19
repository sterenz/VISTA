// src/MiradorViewer.js
import React, { useEffect, useRef } from "react";
import Mirador from "mirador";

const MiradorViewer = () => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const config = {
      id: "my-mirador",
      windows: [
        {
          manifestId: "https://iiif.cosmotest.org/manifest.json",
        },
      ],
    };
    Mirador.viewer(config, []);
  }, []);

  return <div ref={viewerRef} id="my-mirador" style={{ height: "600px" }} />;
};

export default MiradorViewer;
