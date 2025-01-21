import React from "react";
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

const ScatterPlot = () => {
  // Sample JSON data with relationships
  const annotations = [
    {
      id: "urn:uuid:1",
      creationTime: "2024-09-15T10:00:00Z",
      hasAnchor: { label: "Pre-iconographical" },
      creator: { name: "D. Surace" },
    },
    {
      id: "urn:uuid:5",
      creationTime: "2024-04-12T10:00:00Z",
      hasAnchor: { label: "Pre-iconographical" },
      creator: { name: "D. Surace" },
    },
    {
      id: "urn:uuid:6",
      creationTime: "2024-09-09T10:00:00Z",
      hasAnchor: { label: "Pre-iconographical" },
      creator: { name: "D. Surace" },
    },
    {
      id: "urn:uuid:4",
      creationTime: "2024-11-02T10:00:00Z",
      hasAnchor: { label: "Pre-iconographical" },
      creator: { name: "D. Surace" },
    },
    {
      id: "urn:uuid:2",
      creationTime: "2024-10-05T14:30:00Z",
      hasAnchor: { label: "Iconographical" },
      creator: { name: "A. Rossi" },
      relatedTo: ["urn:uuid:1", "urn:uuid:4"], // Connections to pre-iconographical annotations
    },
    {
      id: "urn:uuid:7",
      creationTime: "2024-09-09T14:30:00Z",
      hasAnchor: { label: "Iconographical" },
      creator: { name: "A. Rossi" },
      relatedTo: ["urn:uuid:5", "urn:uuid:4", "urn:uuid:6"], // Connections to pre-iconographical annotations
    },
    {
      id: "urn:uuid:3",
      creationTime: "2024-11-20T12:00:00Z",
      hasAnchor: { label: "Iconological" },
      creator: { name: "M. Bianchi" },
      relatedTo: ["urn:uuid:2"], // Connection to iconographical annotation
    },
  ];

  // Map levels to y-axis positions
  const levelMapping = {
    "Pre-iconographical": 1,
    Iconographical: 2,
    Iconological: 3,
  };

  // Define colors for each recognition level
  const levelColors = {
    "Pre-iconographical": "#FF5733",
    Iconographical: "#33FF57",
    Iconological: "#3357FF",
  };

  // Separate points into datasets by recognition level
  const pointDatasets = Object.keys(levelMapping).map((level) => {
    const levelData = annotations
      .filter((annotation) => annotation.hasAnchor.label === level)
      .map((annotation) => ({
        x: new Date(annotation.creationTime).getTime(),
        y: levelMapping[level],
        label: annotation.creator.name,
        id: annotation.id,
      }));

    return {
      label: level,
      data: levelData,
      backgroundColor: levelColors[level],
      borderColor: levelColors[level],
      pointRadius: 20, // Larger points
    };
  });

  // Prepare connections (lines) between points
  const lineDatasets = annotations
    .filter((annotation) => annotation.relatedTo) // Only include annotations with relationships
    .flatMap((annotation) => {
      const source = annotations.find((a) => a.id === annotation.id);
      return annotation.relatedTo.map((relatedId) => {
        const target = annotations.find((a) => a.id === relatedId);

        if (!source || !target) return null;

        return {
          label: `Connection ${source.id} -> ${relatedId}`,
          data: [
            {
              x: new Date(source.creationTime).getTime(),
              y: levelMapping[source.hasAnchor.label],
            },
            {
              x: new Date(target.creationTime).getTime(),
              y: levelMapping[target.hasAnchor.label],
            },
          ],
          type: "line",
          borderColor: "#FFB400", // Line color
          borderWidth: 2,
          fill: false,
          tension: 0.2,
        };
      });
    })
    .filter(Boolean);

  // Combine point and line datasets
  const data = {
    datasets: [...pointDatasets, ...lineDatasets],
  };

  // Chart.js options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const annotation = context.raw;
            return `Time: ${new Date(
              annotation.x
            ).toLocaleString()}, Level: ${Object.keys(levelMapping).find(
              (key) => levelMapping[key] === annotation.y
            )}, Creator: ${annotation.label}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
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
          callback: (value) =>
            Object.keys(levelMapping).find(
              (key) => levelMapping[key] === value
            ),
        },
      },
    },
  };

  return <Scatter data={data} options={options} />;
};

export default ScatterPlot;
