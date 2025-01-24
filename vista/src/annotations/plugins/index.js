// src/annotations/plugins/index.js

// Import all the plugin definition files
import annotationCreationCompanionWindow from "./annotationCreationCompanionWindow";
import canvasAnnotationsPlugin from "./canvasAnnotationsPlugin";
import externalStorageAnnotationPlugin from "./externalStorageAnnotationPlugin";
import miradorAnnotationPlugin from "./miradorAnnotationPlugin";
import windowSideBarButtonsPlugin from "./windowSideBarButtonsPlugin";

// Export them together in an array
const plugins = [
  annotationCreationCompanionWindow,
  canvasAnnotationsPlugin,
  externalStorageAnnotationPlugin,
  miradorAnnotationPlugin,
  windowSideBarButtonsPlugin,
];

export default plugins;
