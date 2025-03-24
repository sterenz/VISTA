# VISTA

VISTA - Visual Interpretative Semantic Tagging Application

To run the UI with

```bash
cd vista && yarn install
```

Before running the App, you need to start the SimpleAnnotationServer as local instance.

To start the [SimpleAnnotationServer](https://github.com/glenrobson/SimpleAnnotationServer), point to the folder which contains the file `simpleAnnotationStore.war` and run

```bash
java -jar dependency/jetty-runner.jar --port 8888 simpleAnnotationStore.war
```

To run the App

```bash
yarn start
```

## STRUCTURE

It's essential to understand how different parts of the application interact:

**React Components (`AnnotationCreation`)**: Handles the creation and editing of annotations.
**React Context (`AnnotationContext`)**: Provides global state and handlers (addAnnotation, deleteAnnotation) to manage annotations across the application.
**Helper Functions (`annotationHelpers.js`)**: Perform direct operations on localStorage (fetch, add, delete annotations).
**Annotation Collection Adapter (`AnnotationCollectionAdapter.js`)**: Manages a global collection of annotation pages, ensuring synchronization between individual annotation pages and the global collection.

**Cytoscape Component (`AnnotationGraph`)**: Consumes annotations from the context and visualizes them.

## LICENSE

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

This work is licensed under CC BY-NC 4.0 ([Attribution-NonCommercial 4.0 International](https://creativecommons.org/licenses/by-nc/4.0/))  
[![License: CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc/4.0/)
