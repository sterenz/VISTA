// components/ScatterPlot.js

import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  ScatterController,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { fetchAllAnnotations } from "../helpers/annotationHelpers";

// Register Chart.js components
ChartJS.register(
  ScatterController,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  Title
);

// Map levels to y-axis positions
const levelMapping = {
  "Pre-Iconographical": 1,
  Iconographical: 2,
  Iconological: 3,
};

// Define colors for each recognition level
const levelColors = {
  "Pre-Iconographical": "#FF5733", // Red-ish
  Iconographical: "#33FF57", // Green-ish
  Iconological: "#3357FF", // Blue-ish
};

const ScatterPlot = () => {
  const [annotations, setAnnotations] = useState([]);

  // Function to fetch and set annotations
  const loadAnnotations = () => {
    const fetchedAnnotations = fetchAllAnnotations();
    console.log(`Total fetched annotations: ${fetchedAnnotations.length}`);
    setAnnotations(fetchedAnnotations);
  };

  // Fetch annotations on component mount
  useEffect(() => {
    loadAnnotations();

    // Listen for the custom 'annotationsUpdated' event
    const handleAnnotationsUpdate = () => {
      console.log("Received annotationsUpdated event");
      loadAnnotations();
    };

    window.addEventListener("annotationsUpdated", handleAnnotationsUpdate);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("annotationsUpdated", handleAnnotationsUpdate);
    };
  }, []);

  // Transform annotations into data points
  const transformedData = useMemo(() => {
    const data = annotations
      .map((annotation) => {
        const createdObj = annotation.created || null; // 'created' is an object
        const recognitionLevel =
          annotation.hasAnchor?.hasConceptualLevel?.type || "Unknown";

        let creator = "Unknown";

        // Handle 'creator' being either an object or a string
        if (
          typeof annotation.creator === "string" &&
          annotation.creator.trim() !== ""
        ) {
          creator = annotation.creator;
        } else if (
          typeof annotation.creator === "object" &&
          annotation.creator?.name
        ) {
          creator = annotation.creator.name;
        }

        // Handle missing 'created'
        if (!createdObj || !createdObj.value) {
          console.warn(
            `Annotation ${annotation.id} is missing 'created.value'.`
          );
          return null;
        }

        return {
          x: new Date(createdObj.value).getTime(),
          y: levelMapping[recognitionLevel] || 0, // Default to 0 if undefined
          label: creator,
          id: annotation.id,
          relatedTo: Array.isArray(annotation.relatedTo)
            ? annotation.relatedTo
            : [], // Ensure it's an array
        };
      })
      .filter(Boolean); // Remove nulls

    console.log(`Transformed data points:`, data);
    return data;
  }, [annotations]);

  // Separate points into datasets by recognition level
  const pointDatasets = useMemo(() => {
    const datasets = Object.keys(levelMapping).map((level) => {
      const levelData = transformedData.filter((dataPoint) => {
        const levelName = Object.keys(levelMapping).find(
          (key) => levelMapping[key] === dataPoint.y
        );
        return levelName === level;
      });

      return {
        label: level,
        data: levelData,
        backgroundColor: levelColors[level],
        borderColor: levelColors[level],
        pointRadius: 5, // Adjust as needed
      };
    });

    console.log(`Point datasets:`, datasets);
    return datasets;
  }, [transformedData]);

  // Prepare connections (lines) between points
  const connectionDatasets = useMemo(() => {
    const connections = [];

    transformedData.forEach((annotation) => {
      if (annotation.relatedTo && annotation.relatedTo.length > 0) {
        annotation.relatedTo.forEach((relatedId) => {
          const target = transformedData.find((a) => a.id === relatedId);
          if (target) {
            connections.push({
              label: `Connection ${annotation.id} -> ${relatedId}`,
              data: [
                {
                  x: annotation.x,
                  y: annotation.y,
                },
                {
                  x: target.x,
                  y: target.y,
                },
              ],
              type: "line",
              borderColor: "#FFB400", // Line color
              borderWidth: 2,
              fill: false,
              tension: 0.2,
              showLine: true,
              pointRadius: 0, // Hide points on the line
              hoverRadius: 0,
              hoverBorderWidth: 0,
            });
          }
        });
      }
    });

    console.log(`Connection datasets:`, connections);
    return connections;
  }, [transformedData]);

  // Combine point and line datasets
  const data = useMemo(() => {
    const combinedData = {
      datasets: [...pointDatasets, ...connectionDatasets],
    };
    console.log(`Final chart data:`, combinedData);
    return combinedData;
  }, [pointDatasets, connectionDatasets]);

  // Chart.js options
  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataset.type === "line") {
                return null; // Hide tooltip for lines
              }
              const annotation = context.raw;
              const levelName = Object.keys(levelMapping).find(
                (key) => levelMapping[key] === annotation.y
              );
              return `Time: ${new Date(
                annotation.x
              ).toLocaleString()}, Level: ${levelName}, Creator: ${
                annotation.label
              }`;
            },
            afterBody: (context) => {
              const annotation = context[0]?.raw;
              if (!annotation) return "";
              const originalAnnotation = annotations.find(
                (a) => a.id === annotation.id
              );
              if (originalAnnotation && originalAnnotation.body?.value) {
                // Strip HTML tags for readability
                const content = originalAnnotation.body.value.replace(
                  /<\/?[^>]+(>|$)/g,
                  ""
                );
                return `Content: ${content}`;
              }
              return "";
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
            tooltipFormat: "PPpp", // Full date and time
          },
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Recognition Levels",
          },
          ticks: {
            callback: (value) => {
              const level = Object.keys(levelMapping).find(
                (key) => levelMapping[key] === value
              );
              return level || value;
            },
            stepSize: 1,
            min: 0,
            max: 4, // Adjust based on the number of levels
          },
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      // Optional: Maintain aspect ratio
      maintainAspectRatio: false,
    };
  }, [annotations]);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default ScatterPlot;
