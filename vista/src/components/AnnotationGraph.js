import React, { useState, useEffect, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { fetchAllAnnotations } from "../helpers/annotationHelpers";

// Register the cose-bilkent layout
cytoscape.use(coseBilkent);

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
    const criterionSet = new Set();
    const citationSet = new Set();

    // We also keep track of **all** annotation IDs that exist, so we can skip edges
    // referencing annotations that no longer exist.
    const allAnnoIds = new Set(annotations.map((a) => a.id));

    annotations.forEach((anno) => {
      const {
        id,
        body,
        hasAnchor,
        creator,
        stage,
        interpretationType,
        relatedTo,
        disagreeWith,
        wasGeneratedBy,
      } = anno;

      // Quick checks
      if (!id || !body || !hasAnchor) {
        console.warn("Annotation missing fields (id/body/hasAnchor):", anno);
        return;
      }

      // Strip paragraph/HTML tags from the body text
      let labelText = body.value || "No Content";
      // Remove <p> tags specifically:
      labelText = labelText.replace(/<\/?p>/gi, "");
      // Or to remove ALL HTML tags, use a more general regex:
      labelText = labelText.replace(/<\/?[^>]+(>|$)/g, "");

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
          label: labelText || "No Content", // show the annotation's body text in the label
          type: "annotation",
          recognitionLevel, // e.g. "icon:PreiconographicalRecognition"
          stage: stage?.label || "Unknown",
          interpretationType: interpretationType?.label || "",
          creator: creatorName,
        },
      });

      // Possibly add a separate "creator" node
      if (creatorName !== "Unknown") {
        // We'll unify all annos with the same creatorName to a single node
        const creatorId = `creator-${creatorName.replace(/\s+/g, "_")}`;

        // If we haven't created that node, create it now
        if (!creatorSet.has(creatorName)) {
          nodes.push({
            data: {
              id: creatorId,
              label: creatorName,
              type: "creator",
            },
          });
          creatorSet.add(creatorName);
        }

        // Add an edge from the annotation to the creator
        edges.push({
          data: {
            id: `edge-${id}-creator`,
            source: id,
            target: creatorId,
            label: "creator",
          },
        });
      }

      // If we have a single "disagreeWith" property
      // we interpret that as "anno => disagreeWith => otherAnno"
      // If annotation references "disagreeWith"
      // Only create an edge if that target annotation still exists
      if (typeof disagreeWith === "string" && disagreeWith.trim()) {
        if (allAnnoIds.has(disagreeWith.trim())) {
          edges.push({
            data: {
              id: `edge-${id}--${disagreeWith}`,
              source: id,
              target: disagreeWith.trim(),
              label: "disagreesWith",
            },
          });
        } else {
          console.warn(
            `Skipping 'disagreeWith' edge from ${id} to nonexistent ${disagreeWith}`
          );
        }
      }

      // h) If there's an array "relatedTo" => interpret them as "disagreesWith" edges
      if (Array.isArray(relatedTo)) {
        relatedTo.forEach((otherId) => {
          if (allAnnoIds.has(otherId)) {
            edges.push({
              data: {
                id: `edge-${id}--${otherId}`,
                source: id,
                target: otherId,
                label: "disagreesWith",
              },
            });
          } else {
            console.warn(
              `Skipping 'relatedTo' edge from ${id} to nonexistent ${otherId}`
            );
          }
        });
      }

      // i) The "wasGeneratedBy" object might hold 'hasInterpretationCriterion' or 'isExtractedFrom'
      if (wasGeneratedBy) {
        // i.1) if we have "hasInterpretationCriterion"
        if (wasGeneratedBy.hasInterpretationCriterion?.id) {
          const critId = wasGeneratedBy.hasInterpretationCriterion.id;
          const critLabel = wasGeneratedBy.hasInterpretationCriterion.label;

          if (!criterionSet.has(critId)) {
            // Add a node for the criterion
            nodes.push({
              data: {
                id: critId,
                label: "Criterion:\n" + critLabel,
                type: "criterion", // or any distinct type you prefer
              },
            });
            criterionSet.add(critId);
          }
          // Connect annotation -> criterion
          edges.push({
            data: {
              id: `edge-${id}--${critId}`,
              source: id,
              target: critId,
              label: "hasCriterion", // or whichever label
            },
          });
        }

        // i.2) if we have "isExtractedFrom" => treat that as a "citation" or "uri" node
        if (
          wasGeneratedBy.isExtractedFrom?.id &&
          wasGeneratedBy.isExtractedFrom.id.trim() !== ""
        ) {
          const citeUri = wasGeneratedBy.isExtractedFrom.id.trim();
          if (!citationSet.has(citeUri)) {
            // Create a node for that URI
            nodes.push({
              data: {
                id: citeUri,
                label: "Source:\n" + citeUri,
                type: "citation", // or "expression", etc
              },
            });
            citationSet.add(citeUri);
          }
          // Connect annotation -> that URI
          edges.push({
            data: {
              id: `edge-${id}--${citeUri}`,
              source: id,
              target: citeUri,
              label: "extractedFrom",
            },
          });
        }
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
      name: "cose-bilkent", // or 'grid', 'circle', 'cose', 'preset' etc.
      animate: true,
      // animationDuration: 1000,
      // animationEasing: "ease-in-out",
      // nodeDimensionsIncludeLabels: true,
      fit: true,
      padding: 20,
      avoidOverlap: true,
      spacingFactor: 1.2,
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
          //"border-color": "#333",
          "font-size": "10px",
          "text-wrap": "wrap",
          "text-max-width": "100px", // so the label can wrap
          "text-overflow-wrap": "anywhere",
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
      // criterion => diamond
      {
        selector: 'node[type = "criterion"]',
        style: {
          shape: "diamond",
          width: 50,
          height: 50,
          "background-color": "#9FE2BF", // light green
        },
      },
      // citation => triangle
      {
        selector: 'node[type = "citation"]',
        style: {
          shape: "triangle",
          width: 50,
          height: 50,
          "background-color": "#DAB3FF", // pale purple
        },
      },

      // recognition-level-based fill color
      {
        selector:
          'node[recognitionLevel = "icon:PreiconographicalRecognition"]',
        style: {
          "background-color": "rgba(255, 187, 60, 0.3)",
          "border-color": "rgba(255, 187, 60, 0.6)",
        },
      },
      {
        selector: 'node[recognitionLevel = "icon:IconographicalRecognition"]',
        style: {
          "background-color": "rgba(234, 86, 130, 0.3)",
        },
      },
      {
        selector: 'node[recognitionLevel = "icon:IconologicalRecognition"]',
        style: {
          "background-color": "rgba(93, 83, 133, 0.3)",
        },
      },
      // stage-based border color
      // {
      //   selector: 'node[stage = "Draft"]',
      //   style: {
      //     "border-color": "orange",
      //   },
      // },
      // {
      //   selector: 'node[stage = "Published"]',
      //   style: {
      //     "border-color": "green",
      //   },
      // },
      // {
      //   selector: 'node[stage = "Deprecated"]',
      //   style: {
      //     "border-color": "gray",
      //   },
      // },
      // Edges
      {
        selector: "edge",
        style: {
          width: 1,
          "line-color": "#888",
          "target-arrow-color": "#888",
          //"target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)",
          "font-size": "8px",
          "text-background-color": "#F6F2F1",
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
          // Whenever new nodes/edges are added, re-run layout so they can spread out
          cy.on("add", () => {
            cy.layout(layout).run();
          });

          // Example: On node tap => alert a small message
          // cy.on("tap", "node", (evt) => {
          //   const node = evt.target;
          //   alert(
          //     `Annotation ID: ${node.data("id")}\nContent: ${node.data(
          //       "label"
          //     )}`
          //   );
          // });
        }}
      />
    </div>
  );
}

export default AnnotationGraph;
