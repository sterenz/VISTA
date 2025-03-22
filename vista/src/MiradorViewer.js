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

    // Ensure the container is empty before initializing
    if (container) {
      console.log("Cleaning up previous Mirador container...");
      container.innerHTML = "";
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

      if (!miradorInstance.current) {
        console.warn("miradorInstance is already null, skipping cleanup.");
        return;
      }

      try {
        // Reset Mirador Redux store
        if (miradorInstance.current.store) {
          console.log("Resetting Mirador store...");
          miradorInstance.current.store.dispatch({ type: "RESET_MIRADOR" });
        }

        // Remove Mirador container from DOM properly
        if (container) {
          console.log("Removing Mirador container...");
          container.innerHTML = ""; // Clear again
        }

        // Force React to remount the container
        setContainerKey((prevKey) => prevKey + 1);

        miradorInstance.current = null;
        miradorContainerRef.current = null; // Reset ref
        console.log("Mirador instance cleaned up.");
      } catch (error) {
        console.error("Error during Mirador cleanup:", error);
      }
    };
  }, []);

  return (
    <div key={containerKey} id="vista-mirador" ref={miradorContainerRef}></div>
  );
};

export default MiradorViewer;
