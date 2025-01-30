import React, { useState, useEffect, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { fetchAllAnnotations } from "../helpers/annotationHelpers";

/**
 * The AnnotationGraph component:
 * - Loads ALL annotations from localStorage (like ScatterPlot).
 * - Listens for 'annotationsUpdated' to live-update.
 * - Renders them in Cytoscape with a better layout so they don't overlap.
 */
function AnnotationGraph() {
  const [annotations, setAnnotations] = useState([]);

  /**
   * Helper to load everything from localStorage using your existing helper.
   * This matches your ScatterPlot logic exactly.
   */
  const loadAnnotations = () => {
    const fetchedAnnotations = fetchAllAnnotations();
    console.log(
      `AnnotationGraph: loaded ${fetchedAnnotations.length} annotations total`
    );
    setAnnotations(fetchedAnnotations);
  };

  /**
   * On mount, do initial load + attach the 'annotationsUpdated' listener
   */
  useEffect(() => {
    loadAnnotations();

    const handleAnnotationsUpdate = () => {
      console.log("AnnotationGraph: received 'annotationsUpdated' event");
      loadAnnotations();
    };

    window.addEventListener("annotationsUpdated", handleAnnotationsUpdate);
    return () => {
      window.removeEventListener("annotationsUpdated", handleAnnotationsUpdate);
    };
  }, []);

  /**
   * Transform your entire `annotations` array -> Cytoscape nodes & edges
   */
  const elements = useMemo(() => {
    const nodes = [];
    const edges = [];
    // Keep track of creatorName => whether we already made a node for them
    const creatorSet = new Set();

    annotations.forEach((anno) => {
      const {
        id,
        body,
        hasAnchor,
        creator,
        stage,
        interpretationType,
        relatedTo,
      } = anno;

      // Quick checks
      if (!id || !body || !hasAnchor) {
        console.warn("Annotation missing fields (id/body/hasAnchor):", anno);
        return;
      }

      // Example: get the recognition class, e.g. "icon:PreiconographicalRecognition"
      const recognitionLevel = hasAnchor.hasConceptualLevel?.type || "Unknown";
      // Resolve creator name
      let creatorName = "Unknown";
      if (typeof creator === "string" && creator.trim()) {
        creatorName = creator.trim();
      } else if (typeof creator === "object" && creator?.name) {
        creatorName = creator.name;
      }

      // Create an annotation node
      nodes.push({
        data: {
          id,
          label: body.value || "No Content", // show the annotation's body text in the label
          type: "annotation",
          recognitionLevel, // e.g. "icon:PreiconographicalRecognition"
          stage: stage?.label || "Unknown",
          interpretationType: interpretationType?.label || "",
          creator: creatorName,
        },
      });

      // Possibly create a separate "creator" node
      if (creatorName !== "Unknown" && !creatorSet.has(creatorName)) {
        const creatorId = `creator-${creatorName.replace(/\s+/g, "_")}`;
        nodes.push({
          data: {
            id: creatorId,
            label: creatorName,
            type: "creator",
          },
        });
        creatorSet.add(creatorName);

        // Edge from the annotation to the creator
        edges.push({
          data: {
            id: `edge-${id}-creator`,
            source: id,
            target: creatorId,
            label: "creator",
          },
        });
      } else if (creatorName !== "Unknown") {
        // If the node already exists, just add an edge for this annotation
        const creatorId = `creator-${creatorName.replace(/\s+/g, "_")}`;
        edges.push({
          data: {
            id: `edge-${id}-creator`,
            source: id,
            target: creatorId,
            label: "creator",
          },
        });
      }

      // If there's an array of IDs in `relatedTo`, interpret them as "disagreesWith"
      if (Array.isArray(relatedTo)) {
        relatedTo.forEach((otherId) => {
          edges.push({
            data: {
              id: `edge-${id}--${otherId}`,
              source: id,
              target: otherId,
              label: "disagreesWith",
            },
          });
        });
      }
    });

    console.log(
      `AnnotationGraph: built ${nodes.length} nodes & ${edges.length} edges.`
    );
    return [...nodes, ...edges];
  }, [annotations]);

  /**
   * A simpler layout so nodes won't overlap each other so badly.
   * Try 'grid', 'circle', 'concentric', or 'cose' if you prefer.
   */
  const layout = useMemo(
    () => ({
      name: "preset", // or 'grid', 'circle', 'cose', 'preset' etc.
      //animate: true,
      // animationDuration: 1000,
      // animationEasing: "ease-in-out",
      // nodeDimensionsIncludeLabels: true,
      //fit: true,
      // padding: 30,
      // avoidOverlap: true,
      //spacingFactor: 1.2,
      // If you prefer a chronological approach, you'd do 'preset' and set positions yourself
    }),
    []
  );

  /**
   * A Cytoscape stylesheet that:
   * - sets shape, fill color, border color, etc.
   * - color based on recognition level, stage, etc.
   */
  const stylesheet = useMemo(
    () => [
      // Default node style
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          "background-color": "#ccc",
          "border-style": "solid",
          "border-width": 2,
          "border-color": "#333",
          "font-size": "10px",
        },
      },
      // annotation => ellipse
      {
        selector: 'node[type = "annotation"]',
        style: {
          shape: "ellipse",
          width: 60,
          height: 60,
        },
      },
      // creator => square
      {
        selector: 'node[type = "creator"]',
        style: {
          shape: "square",
          width: 50,
          height: 50,
          "background-color": "#FFD700", // gold
        },
      },
      // recognition-level-based fill color
      {
        selector:
          'node[recognitionLevel = "icon:PreiconographicalRecognition"]',
        style: {
          "background-color": "rgba(255, 0, 0, 0.3)",
        },
      },
      {
        selector: 'node[recognitionLevel = "icon:IconographicalRecognition"]',
        style: {
          "background-color": "rgba(0, 255, 0, 0.3)",
        },
      },
      {
        selector: 'node[recognitionLevel = "icon:IconologicalRecognition"]',
        style: {
          "background-color": "rgba(0, 0, 255, 0.3)",
        },
      },
      // stage-based border color
      {
        selector: 'node[stage = "Draft"]',
        style: {
          "border-color": "orange",
        },
      },
      {
        selector: 'node[stage = "Published"]',
        style: {
          "border-color": "green",
        },
      },
      {
        selector: 'node[stage = "Deprecated"]',
        style: {
          "border-color": "gray",
        },
      },
      // Edges
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#888",
          "target-arrow-color": "#888",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)",
          "font-size": "8px",
          "text-background-color": "#fff",
          "text-background-opacity": 1,
          "text-background-padding": "2px",
        },
      },
      // disagreesWith edges => red
      {
        selector: 'edge[label = "disagreesWith"]',
        style: {
          "line-color": "red",
          "target-arrow-color": "red",
        },
      },
    ],
    []
  );

  return (
    <div style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}>
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(elements)}
        layout={layout}
        stylesheet={stylesheet}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => {
          // Example: On node tap => alert a small message
          cy.on("tap", "node", (evt) => {
            const node = evt.target;
            alert(
              `Annotation ID: ${node.data("id")}\nContent: ${node.data(
                "label"
              )}`
            );
          });
        }}
      />
    </div>
  );
}

export default AnnotationGraph;
