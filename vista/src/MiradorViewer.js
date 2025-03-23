import React, { useEffect, useState, useRef } from "react";
import Mirador from "mirador";
import { vistaTheme } from "./themes/vistaTheme";
import "./index.css";

// Import your local plugins
import annotationPlugins from "./annotations/plugins";

// Import both adapters (local + SAS)
// import SimpleAnnotationServerV2Adapter from "./annotations/adapters/SimpleAnnotationServerV2Adapter";
import LocalStorageAdapter from "./annotations/adapters/LocalStorageAdapter";

const MiradorViewer = () => {
  const miradorInstance = useRef(null);
  const miradorContainerRef = useRef(null);
  const [containerKey, setContainerKey] = useState(0); // Used to force a remount

  useEffect(() => {
    console.log("Initializing Mirador...");

    const container = miradorContainerRef.current; // Store ref value

    // Cleanup any previous instance before re-initializing
    if (miradorInstance.current) {
      console.log("Destroying previous Mirador instance...");
      miradorInstance.current.store.dispatch({ type: "RESET_MIRADOR" });
      miradorInstance.current = null;
    }

    // Toggle which adapter you want to use:
    //const adapter = (canvasId) => new LocalStorageAdapter(canvasId); // <--- Uncomment to use local storage
    //new SimpleAnnotationServerV2Adapter(canvasId, "http://localhost:8888/annotation"); // <--- Uncomment to use SAS

    // Mirador configuration
    const config = {
      id: "vista-mirador",
      annotation: {
        // Use whichever adapter is uncommented
        adapter: (canvasId) => {
          const pageId = `${canvasId}/annotation-page`;
          // Return your existing LocalStorageAdapter
          return new LocalStorageAdapter(pageId);
        }, // Set to true to display annotation JSON export button
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
          // "https://manifests.collections.yale.edu/yuag/obj/359"
        },
      ],
    };

    // Initialize Mirador
    miradorInstance.current = Mirador.viewer(config, annotationPlugins);
    console.log("Mirador instance created:", miradorInstance.current);

    return () => {
      console.log("Cleanup function running...");

      if (miradorInstance.current) {
        console.log("Resetting Mirador store...");
        miradorInstance.current.store.dispatch({ type: "RESET_MIRADOR" });
        miradorInstance.current = null;
      }

      // Instead of modifying innerHTML, trigger a React re-mount
      setContainerKey((prevKey) => prevKey + 1);
    };
  }, []);

  return (
    <div key={containerKey} id="vista-mirador" ref={miradorContainerRef}></div>
  );
};

export default MiradorViewer;
