import React, { useEffect } from "react";
import Mirador from "mirador";
import { vistaTheme } from "./themes/vistaTheme";
import "./styles/style.css";

// Import your local plugins
import annotationPlugins from "./annotations/plugins";

// Import both adapters (local + SAS)
// import SimpleAnnotationServerV2Adapter from "./annotations/adapters/SimpleAnnotationServerV2Adapter";
import LocalStorageAdapter from "./annotations/adapters/LocalStorageAdapter";

const MiradorViewer = () => {
  useEffect(() => {
    // Toggle which adapter you want to use:
    const adapter = (canvasId) => new LocalStorageAdapter(canvasId); // <--- Uncomment to use local storage
    //new SimpleAnnotationServerV2Adapter(canvasId, "http://localhost:8888/annotation"); // <--- Uncomment to use SAS

    const config = {
      id: "vista-mirador",
      annotation: {
        // Use whichever adapter is uncommented
        adapter,
        // Set to true to display annotation JSON export button
        exportLocalStorageAnnotations: true,
      },
      ...vistaTheme, // Merge the theme configuration

      window: {
        defaultSideBarPanel: "annotations",
        // Open sidebar by default
        sideBarOpenByDefault: true,
      },
      windows: [
        {
          manifestId:
            "https://media.getty.edu/iiif/manifest/dff643f5-be35-4009-a36b-b392ee5d45fd",
        },
      ],
    };

    // Initialize Mirador viewer with configuration and annotation plugins
    Mirador.viewer(config, annotationPlugins);
  }, []);

  // Render the container for Mirador viewer
  return <div id="vista-mirador"></div>;
};

export default MiradorViewer;
