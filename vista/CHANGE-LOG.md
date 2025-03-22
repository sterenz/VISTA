# 📑 Change log

2025-22-03 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Modified `AnnotationGraph.js`.
- Added rule in `index-css` to hide runtime error ui.

2025-20-03 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Created `BottomNavigation.js`.
- Added Tailwind CSS and create variables for colors.

2025-04-03 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Tested workflow.
- CSS adjustments.

2025-20-02 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Tested workflow.

2025-04-02 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Try to fix the multiple renders in same context provider by modifing `AnnotationDrawing.js`.
  The issue persists but the svg are correctly rendered.

2025-30-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Added Cytoscape layout with `yarn add cytoscape-cose-bilkent`.
- Modified `AnnotationGraph` to listen for `annotationsUpdate`.
- Modified `LocalSotrageAdapter` with `window.dispatchEvent` to fire `annotationsUpdate` handler.
- Added Cola with `yarn add cytoscape-cola`.
  TODO: Check if needed
- Created `AnnotationGraph` to render annotations graph netwrok.
- Added Cytoscape to render graphs with `yarn add react-cytoscapejs` and `yarn add cytoscape@3.2.19 `.

2025-29-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Mapped `recognitionClass` and `stageClass` to dynamically asssign correct class.
- Modified `saveRdf` in `LocalStorageAdapter.js` to drop all existing annotations to not duplicate them.
- 👀 Implemented JSON-LD context in contexs in `LocalStorageAdapter.js` to correctly convert in N-Quads.
- CORS error need to be fix to establish the connection with Blazegraph.
  For the demo I used a browser extension to allow CORS.
- Added the Blazegraph variable in `AnnotationCollectioonAdapter.js` and `LocalStorageAdapter.js`.
- Created local environment variable to store Blazegraph endpoint.

2025-28-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Added `disagreeWith` in `WebAnnotation.js`.
- Created `addInterpretation` logic in `AnnotationCreation.js`.
  Now when editing an annotation it takes same target as the previous one adding `cito:disagreeWith` property.
- Tested conditional rendering of annotation list item in `CanvasListItem.js` (stage colored left border).
- `canvasAnnotationPlugin.js` wraps default Mirador annotation list.
- Added render of metadata (creator, stage and URI) in annotations list (left sidebar) in `CanvasListItem.js`.
- Implemented fetching LocalStorage in `ScatterPlot.js`.
  TODO: Add Level of Recognition connections into data model.
- Fixed state recognition in annotation edit mode. Now the UI display the fields of the annotation.
  `annotationCreationCompanionWindow.js` reads all the keys in annotation object;
  `AnnotationCreation.js` now uses a single local object `annoState` to store everything.
- TODO: Understand if needed the re-render of svg based on the edited fields.

2025-27-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- ⚠️ Modified `MiradorViewer.js` to read new annotation page ID.
- TODO: Fix the free-hand annotation drawing tool is causing a "multiple renders" warning.
- Created a new ID generetor for annotation pages in const `annotationPageId`.
- Created `AnnotationCollectionAdapter.js` to store Annotation Collections.
- Added `creationTime` in annotatation model.
- Created `annotationHelpers.js` in `helpers` to fetch annotation's JSON form LocaleStorage.
- Fixing `hasStage` logic in `AnnotationCreation.js` and `WebAnnotation.js`.
- Reintroduced `hasAnchor` in creating the annotation JSON.

2025-26-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Updated UI structure in `AnnotationCreation.js`.
- Modified `AnnotationDrawing.js` to accept `fillColor` and `strokeColor`.
- Installed `material-ui/lab` with `yarn add @material-ui/lab`.
- Created `.env` to store global variables.
- Updated `LocalStorageAdapter.js` with new classes and properties.

2025-24-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Refactored all plugins exports.
- Removed `<React.StrictMode>` in `index.js`.

2025-21-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Created `ScatterPlot.js` to test visualization of annotations over time and over level of recognition.
- Created `vistaTheme` to handle Mirador visual style theme.
- Created `style.css` to handle app style.
- Method `reExportPaths` in `AnnotationDrawing.js` handle fillColor rerender that allows to first draw the annotation and then change the fill color.

2025-20-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Conditional annotation's color fill based on the level of interpretation selected.
  Modified `AnnotationCreation.js` and `AnnotationDrawing.js` files.
- Connected SimpleAnnotationServer to store annotations.
- Imported files from `mirador-multi-level-annotations`.
- Created plugin folder structure.
- Deleted useless file in the `VISTA` folder.

2025-19-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

- Install the url polyfill and CRACO and modified `package.json`.
- Created `MiradorViewer.js`.
- Installed Mirador 3 with `yarn add mirador`.
- Created React App with `yarn create react-app vista`.
