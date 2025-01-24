import jsonld from "jsonld";
import axios from "axios";

// Configuration flag to toggle Blazegraph saving
const SAVE_TO_BLAZEGRAPH = process.env.REACT_APP_SAVE_TO_BLAZEGRAPH === "true"; // Disabled in .env during development

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
        items: [],
      };
      let annotationPage = await this.all();
      if (!annotationPage) {
        annotationPage = emptyAnnoPage;
      }

      // Validate the annotation structure

      annotationPage.items.push(annotation);
      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage)
      );
      console.log("Updated Annotation Page:", annotationPage);

      const rdfData = await this.toRdf(annotationPage);
      if (rdfData) {
        await this.saveRdf(rdfData);
      } else {
        console.warn(
          "RDF serialization failed. Annotation not saved to Blazegraph."
        );
      }

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
      const rdfData = await jsonld.toRDF(jsonLdData, { format: format });
      return rdfData;
    } catch (error) {
      console.error("Error converting JSON-LD to RDF:", error);
      throw error; // Propagate the error for higher-level handling
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
  async all() {
    try {
      const data = localStorage.getItem(this.annotationPageId);
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing annotation page from localStorage:", error);
      return null;
    }
  }
  // Define the @context
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
