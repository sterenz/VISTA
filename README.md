# VISTA - Visual Interpretative Semantic Tagging Application

VISTA is a **web-based annotation tool** designed for **collaborative semantic tagging** of artworks using **IIIF manifests**. It extends **Mirador** to support structured **multi-level interpretations** based on **Panofsky’s tripartition** (Pre-Iconographical, Iconographical, and Iconological levels).

With VISTA, users can:

- Annotate specific areas of an artwork.
- Link different levels of recognition.
- Disagree with existing interpretations and propose alternatives.
- Visualize annotation relationships in a graph-based interface.

## 🚀 Why VISTA?

Art interpretation is a layered process involving multiple levels of meaning. Traditional annotation tools often lack structured mechanisms to represent these levels and their relationships.

VISTA was created to:

- Enable **structured, multi-level annotation** of artworks.
- Foster **collaborative art analysis**, allowing disagreements and alternative perspectives.
- Leverage **IIIF and Mirador** for seamless integration with existing digital archives.
- Provide **graph-based visualization** of annotation relationships.

## 🏗️ Architecture

- **Mirador Integration**: Mirador (version 3) is installed using:

  ```bash
  yarn add mirador
  ```

  The [Mirador repository](https://github.com/ProjectMirador/mirador) is used, along with the [mirador-annotations plugin](https://github.com/ProjectMirador/mirador-annotations), which is manually imported for better UI and functionality customization.

VISTA builds on existing IIIF technologies and is structured as follows:

- **Frontend**: A React-based UI extending **Mirador** for annotation functionalities. React efficiently manages state and UI re-rendering while fetching data from various sources.
- **Styling**: Uses **Tailwind CSS** for a modular, maintainable design.
- **IIIF & Mirador Integration**: Leverages **Mirador v3**, with manual integration of the **mirador-annotations plugin** for enhanced UI and annotation handling.
- **LISA Data Model**: The core model for annotation storage and retrieval. LISA:
  - Implements **Panofsky’s tripartition** for hierarchical interpretation.
  - Structures annotations using the **Web Annotation Data Model (WADM)**.
  - Organizes annotation collections and their relationships.
- **Graph Visualization**: Uses **[Cytoscape.js](https://js.cytoscape.org/)** to display annotation relationships in an interactive network graph.
- **Semantic Storage**: Annotations can be stored **as RDF in Blazegraph** using **JSON-LD**, ensuring semantic interoperability.

### 📂 File Organization

- **`src/annotations/`** – Handles annotations with:

  - **Adapters** (e.g., `AnnotationCollectionAdapter.js`, `LocalStorageAdapter.js`) for annotation storage and Blazegraph integration.
  - **Components** for Mirador’s annotation UI (draw, edit, manage annotations).
  - **Plugins** like `miradorAnnotationPlugin.js` to extend Mirador’s annotation capabilities.

- **`src/components/`** – Stores custom React UI components (annotation cards, manager, header, etc.).

- **`src/helpers/`** – Utility functions, including JSON-LD handling and annotation management.

- **`src/MiradorViewer.js`** – Configures and renders Mirador within the app.

---

## ⚠️ Drawbacks

While VISTA enhances the annotation process, it comes with some trade-offs:

- **Learning Curve**: The multi-level annotation model may require training for new users.
- **LocalStorage Limitations**: Currently, annotations are stored locally unless integrated with a semantic backend.
- **Integration Dependency**: VISTA relies on Mirador and IIIF, meaning its functionality is limited to IIIF-supported collections.

---

## 💻 Development Setup

To set up VISTA locally, follow these steps:

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

```bash
yarn build
```

Builds the app for production to the `build` folder.\

## 📜 License

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

This work is licensed under CC BY-NC 4.0 ([Attribution-NonCommercial 4.0 International](https://creativecommons.org/licenses/by-nc/4.0/))  
[![License: CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc/4.0/)
