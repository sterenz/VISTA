# 📑 Change log

2025-26-01 - Stefano Renzetti <stefano.renzetti3@studio.unibo.it>

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
