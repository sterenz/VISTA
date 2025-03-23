import React, { useState, useEffect } from "react";
import { fetchAllAnnotations } from "../helpers/annotationHelpers";
import AnnotationCard from "./AnnotationCard"; // Your card component

const ManageAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);

  // Helper to load annotations from localStorage
  const loadAnnotations = () => {
    const fetchedAnnotations = fetchAllAnnotations();
    console.log(
      `ManageAnnotations: loaded ${fetchedAnnotations.length} annotations`
    );
    setAnnotations(fetchedAnnotations);
  };

  // Load annotations on component mount and subscribe to live updates
  useEffect(() => {
    loadAnnotations();

    const handleAnnotationsUpdate = () => {
      console.log("ManageAnnotations: annotations updated");
      loadAnnotations();
    };

    window.addEventListener("annotationsUpdated", handleAnnotationsUpdate);
    return () => {
      window.removeEventListener("annotationsUpdated", handleAnnotationsUpdate);
    };
  }, []);

  // // Group annotations by recognition level - USE IF LARGE NUMBER OF ANNOTATIONS IS INVOLVED
  // const groupedAnnotations = useMemo(() => {
  //   const groups = {
  //     "Pre-Iconographical": [],
  //     Iconographical: [],
  //     Iconological: [],
  //   };
  //   annotations.forEach((anno) => {
  //     // Expecting the recognition level to be stored at:
  //     // anno.hasAnchor.hasConceptualLevel.type or .label
  //     const recognition =
  //       anno.hasAnchor?.hasConceptualLevel?.type ||
  //       anno.hasAnchor?.hasConceptualLevel?.label ||
  //       "Unknown";
  //     if (groups[recognition]) {
  //       groups[recognition].push(anno);
  //     } else {
  //       // If the level is not recognized, add it to a fallback group
  //       groups["Unknown"] = groups["Unknown"] || [];
  //       groups["Unknown"].push(anno);
  //     }
  //   });
  //   return groups;
  // }, [annotations]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-12 h-screen">
        {/* Pre-Iconographical Column */}
        <div
          id="pre-iconographical"
          className="rounded-xl p-4 border border-vista-white-dark text-center overflow-y-scroll no-scrollbar mb-24"
        >
          <h3 className="text-sm font-semibold mb-4 text-vista-gray uppercase">
            Pre-Iconographical Recognition
          </h3>
          {annotations
            .filter(
              (anno) =>
                anno.hasAnchor?.hasConceptualLevel?.label ===
                "Pre-Iconographical"
            )
            .map((anno) => (
              <AnnotationCard
                key={anno.id}
                id={anno.id}
                creator={anno.creator?.name || "Unknown"}
                body={anno.body?.value || ""}
                recognition="Pre-Iconographical"
                citation={anno.wasGeneratedBy?.isExtractedFrom?.id || ""}
                stage={anno.hasStage?.label || "Unknown"}
                onDisagree={(id) => console.log("Disagree", id)}
                onEdit={(id) => console.log("Edit", id)}
                onConnect={(id) => console.log("Connect", id)}
              />
            ))}
          <button className="w-full rounded-lg mx-auto py-12 border-2 border-dashed border-vista-yellow-dark font-bold text-vista-yellow-dark">
            + Add recognition in Mirador
          </button>
        </div>
        {/* Iconographical Column */}
        <div
          id="iconographical"
          className="rounded-xl p-4 border border-vista-white-dark text-center overflow-y-scroll no-scrollbar mb-24"
        >
          <h3 className="text-sm font-semibold mb-4 text-vista-gray uppercase">
            Iconographical Recognition
          </h3>
          {annotations
            .filter(
              (anno) =>
                anno.hasAnchor?.hasConceptualLevel?.label === "Iconographical"
            )
            .map((anno) => (
              <AnnotationCard
                key={anno.id}
                id={anno.id}
                creator={anno.creator?.name || "Unknown"}
                body={anno.body?.value || ""}
                recognition="Iconographical"
                citation={anno.wasGeneratedBy?.isExtractedFrom?.id || ""}
                stage={anno.hasStage?.label || "Unknown"}
                onDisagree={(id) => console.log("Disagree", id)}
                onEdit={(id) => console.log("Edit", id)}
                onConnect={(id) => console.log("Connect", id)}
              />
            ))}
          <button className="w-full rounded-lg mx-auto py-12 border-2 border-dashed border-vista-magenta-dark font-bold text-vista-magenta-dark">
            + Add recognition
          </button>
        </div>
        {/* Iconological Column */}
        <div
          id="iconological"
          className="rounded-xl p-4 border border-vista-white-dark text-center overflow-y-scroll no-scrollbar mb-24"
        >
          <h3 className="text-sm font-semibold mb-4 text-vista-gray uppercase">
            Iconological Recognition
          </h3>
          {annotations
            .filter(
              (anno) =>
                anno.hasAnchor?.hasConceptualLevel?.label === "Iconological"
            )
            .map((anno) => (
              <AnnotationCard
                key={anno.id}
                id={anno.id}
                creator={anno.creator?.name || "Unknown"}
                body={anno.body?.value || ""}
                recognition="Iconological"
                citation={anno.wasGeneratedBy?.isExtractedFrom?.id || ""}
                stage={anno.hasStage?.label || "Unknown"}
                onDisagree={(id) => console.log("Disagree", id)}
                onEdit={(id) => console.log("Edit", id)}
                onConnect={(id) => console.log("Connect", id)}
              />
            ))}
          <button className="w-full rounded-lg mx-auto py-12 border-2 border-dashed border-vista-purple-dark font-bold text-vista-purple-dark">
            + Add recognition
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageAnnotations;
