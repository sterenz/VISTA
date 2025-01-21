// src/MiradorViewer.js
import React, { useEffect, useRef } from "react";
import Mirador from "mirador";

// Import your local array of plugin definitions
import annotationPlugins from "./annotations/plugins";

// Import the SimpleAnnotationServerV2Adapter
import SimpleAnnotationServerV2Adapter from "./annotations/adapters/SimpleAnnotationServerV2Adapter";

const MiradorViewer = () => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const config = {
      id: "vista-mirador",

      annotation: {
        adapter: (canvasId) =>
          new SimpleAnnotationServerV2Adapter(
            canvasId,
            "http://localhost:8888/annotation"
          ),
        // Set to true to display annotation JSON export button
        exportLocalStorageAnnotations: true,
      },

      windows: [
        {
          manifestId:
            "https://media.getty.edu/iiif/manifest/dff643f5-be35-4009-a36b-b392ee5d45fd",
          // imageToolsEnabled: true,  (optional)
        },
      ],

      window: {
        // Set default sidebar panel to annotations

        defaultSideBarPanel: "annotations",
        // Open sidebar by default

        sideBarOpenByDefault: true,
      },
    };
    Mirador.viewer(config, annotationPlugins);
  }, []);

  return <div ref={viewerRef} id="vista-mirador" style={{ height: "600px" }} />;
};

export default MiradorViewer;
