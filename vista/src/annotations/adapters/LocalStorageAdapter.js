import jsonld from "jsonld";
import axios from "axios";
import AnnotationCollectionAdapter from "./AnnotationCollectionAdapter";

// Configuration flag to toggle Blazegraph saving
const SAVE_TO_BLAZEGRAPH = process.env.REACT_APP_SAVE_TO_BLAZEGRAPH === "true"; // Disabled in .env during development

// // Initialize one global adapter
// const globalCollectionAdapter = new AnnotationCollectionAdapter(
//   undefined, // no explicit ID => auto-generate from PURL + number
//   "myGlobalAnnotationCollection" // localStorage key
// );

// Potential approach to reuse the same dynamic ID across sessions:
let storedId = localStorage.getItem("CURRENT_COLLECTION_ID");
if (!storedId) {
  // We want a new one, so create the adapter w/o an ID
  const tempAdapter = new AnnotationCollectionAdapter(
    undefined,
    "myGlobalAnnotationCollection"
  );
  storedId = tempAdapter.collectionId;
  localStorage.setItem("CURRENT_COLLECTION_ID", storedId);
}
const globalCollectionAdapter = new AnnotationCollectionAdapter(
  storedId,
  "myGlobalAnnotationCollection"
);

export default class LocalStorageAdapter {
  constructor(annotationPageId) {
    this.annotationPageId = annotationPageId;
  }

  // Creation of the annotation
  async create(annotation) {
    try {
      const emptyAnnoPage = {
        "@context": this.getContext(),
        id: this.annotationPageId,
        type: "AnnotationPage",
        // Key part: reference back to the global collection
        "dct:isPartOf": [
          {
            id: globalCollectionAdapter.collectionId,
            type: "AnnotationCollection",
            // Optional: also inline label or total
            label: { en: ["My Global Annotation Collection"] },
          },
        ],
        items: [],
      };

      let annotationPage = await this.all();
      if (!annotationPage) {
        annotationPage = emptyAnnoPage;
      }

      // Validate the annotation structure
      annotationPage.items.push(annotation);
      // Store page

      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage)
      );
      console.log("Updated Annotation Page:", annotationPage);

      // Possibly store RDF

      const rdfData = await this.toRdf(annotationPage);
      if (rdfData) {
        await this.saveRdf(rdfData);
      } else {
        console.warn(
          "RDF serialization failed. Annotation not saved to Blazegraph."
        );
      }

      // Also add this page to the global collection
      await globalCollectionAdapter.addAnnotationPage(this.annotationPageId);

      return annotationPage;
    } catch (error) {
      console.error("Error creating annotation:", error);
      throw error; // Propagate the error for higher-level handling
    }
  }

  // Update annotation
  async update(annotation) {
    try {
      const annotationPage = await this.all();
      if (!annotationPage) {
        throw new Error("Annotation page does not exist.");
      }

      const currentIndex = annotationPage.items.findIndex(
        (item) => item.id === annotation.id
      );

      if (currentIndex === -1) {
        throw new Error(`Annotation with id ${annotation.id} not found.`);
      }

      annotationPage.items.splice(currentIndex, 1, annotation);
      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage)
      );

      const rdfData = await this.toRdf(annotationPage);
      if (rdfData) {
        await this.saveRdf(rdfData);
      }

      return annotationPage;
    } catch (error) {
      console.error("Error updating annotation:", error);
      throw error;
    }
  }

  // Delete annotation
  async delete(annoId) {
    try {
      const annotationPage = await this.all();
      if (!annotationPage) {
        throw new Error("Annotation page does not exist.");
      }

      const initialLength = annotationPage.items.length;
      annotationPage.items = annotationPage.items.filter(
        (item) => item.id !== annoId
      );

      if (annotationPage.items.length === initialLength) {
        console.warn(`Annotation with id ${annoId} not found.`);
      }

      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage)
      );

      const rdfData = await this.toRdf(annotationPage);
      if (rdfData) {
        await this.saveRdf(rdfData);
      }

      return annotationPage;
    } catch (error) {
      console.error("Error deleting annotation:", error);
      throw error;
    }
  }

  // Fetching single annotation
  async get(annoId) {
    try {
      const annotationPage = await this.all();
      if (!annotationPage) {
        throw new Error("Annotation page does not exist.");
      }

      const annotation = annotationPage.items.find(
        (item) => item.id === annoId
      );
      if (!annotation) {
        console.warn(`Annotation with id ${annoId} not found.`);
      }

      return annotation || null;
    } catch (error) {
      console.error("Error fetching annotation:", error);
      throw error;
    }
  }

  // RDF serialization
  async toRdf(jsonLdData, format = "application/n-quads") {
    try {
      return await jsonld.toRDF(jsonLdData, { format });
    } catch (error) {
      console.error("Error converting JSON-LD to RDF:", error);
      throw error;
    }
  }

  // Save RDF to Blazegraph
  async saveRdf(rdfData) {
    if (!SAVE_TO_BLAZEGRAPH) {
      console.log("Blazegraph saving is disabled. Skipping saveRdf.");
      return;
    }

    console.log("Serialized RDF Data:", rdfData);
    const sparqlUpdate = `
      INSERT DATA { ${rdfData} }
    `;
    try {
      const response = await axios.post(
        "http://localhost:80/blazegraph/sparql",
        sparqlUpdate,
        {
          headers: {
            "Content-Type": "application/sparql-update",
          },
        }
      );
      console.log("Blazegraph Response:", response.status, response.statusText);
    } catch (error) {
      console.error(
        "Error saving RDF to Blazegraph:",
        error.response?.data || error.message
      );
      // Optionally, implement further error handling here
    }
  }

  // Fetching all annotations
  // async all() {
  //   try {
  //     const data = localStorage.getItem(this.annotationPageId);
  //     if (!data) {
  //       return null;
  //     }
  //     return JSON.parse(data);
  //   } catch (error) {
  //     console.error("Error parsing annotation page from localStorage:", error);
  //     return null;
  //   }
  // }

  // Fetching all annotations with new structure annotation page new id !! NOT WORKING
  async all() {
    const data = localStorage.getItem(this.annotationPageId);
    if (!data) return null;
    return JSON.parse(data);
  }

  // Define the @context based on your ontology
  getContext() {
    return {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      foaf: "http://xmlns.com/foaf/0.1/",
      ecrm: "http://erlangen-crm.org/current/",
      dct: "http://purl.org/dc/terms/",
      oa: "http://www.w3.org/ns/oa#",
      sc: "http://www.shared-canvas.org/ns/",
      mlao: "http://w3id.org/mlao#",
      prov: "http://www.w3.org/ns/prov#",
      hico: "http://purl.org/emmedi/hico",
      cito: "http://purl.org/spar/cito/",
      icon: "https://w3id.org/icon/ontology/",
      lrm: "http://iflastandards.info/ns/lrm/lrmoo/",
      lisa: "http://sterenz.github.io/lisa/ontology/",
      type: "@type",
      id: "@id",

      // Classes
      AnnotationCollection: "oa:AnnotationCollection",
      AnnotationPage: "oa:AnnotationPage",
      Annotation: "oa:Annotation",
      TextualBody: "oa:TextualBody",
      SpecificResource: "oa:SpecificResource",
      FragmentSelector: "oa:FragmentSelector",
      Canvas: "sc:Canvas",
      Manifest: "sc:Manifest",
      Manifestation: "lrm:F3_Manifestation",
      Anchor: "mlao:Anchor",
      PreiconographicalRecognition: "icon:PreiconographicalRecognition",
      IconographicalRecognition: "icon:IconographicalRecognition",
      IconologicalRecognition: "icon:IconologicalRecognition",
      Person: "foaf:Person",
      Motivation: "oa:Motivation",
      InterpretationAct: "hico:InterpretationAct",
      InterpretationCriterion: "hico:InterpretationCriterion",
      InterpretationType: "hico:InterpretationType",
      Expression: "lrm:F2_Expression",
      Entity: "ecrm:E1_Entity",
      PropositionalObject: "ecrm:E89_Propositional_Object",
      SymbolicObject: "ecrm:E90_Symbolic_Object",
      Draft: "lisa:Draft",
      Published: "lisa:Published",
      PublishingStage: "lisa:PublishingStage",
      Deprecated: "lisa:Deprecated",

      // Properties
      value: "rdf:value",
      label: "rdfs:label",
      subClassOf: "rdfs:subClassOf",
      creator: "dct:creator",
      created: {
        "@id": "dct:created",
        "@type": "xsd:dateTime",
      },
      isPartOf: "dct:isPartOf",
      name: "foaf:name",
      motivatedBy: "oa:motivatedBy",
      hasBody: "oa:hasBody",
      hasTarget: "oa:hasTarget",
      hasSource: "oa:hasSource",
      hasAnchor: "mlao:hasAnchor",
      isAnchoredTo: "mlao:isAnchoredTo",
      hasConceptualLevel: "mlao:hasConceptualLevel",
      hasInterpretationCriterion: "hico:hasInterpretationCriterion",
      hasInterpretationType: "hico:hasInterpretationType",
      isExtractedFrom: "hico:isExtractedFrom",
      agreesWith: "cito:agreesWith",
      disagreesWith: "cito:disagreesWith",
      wasGeneratedBy: "prov:wasGeneratedBy",
      startedAtTime: {
        "@id": "prov:startedAtTime",
        "@type": "xsd:dateTime",
      },
      generatedAtTime: {
        "@id": "prov:generatedAtTime",
        "@type": "xsd:dateTime",
      },
      wasAttributedTo: "prov:wasAttributedTo",
      hasStage: "lisa:hasStage",
      transitionTo: "lisa:transitionTo",
    };
  }
}
