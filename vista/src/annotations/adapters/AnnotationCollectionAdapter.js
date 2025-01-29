import axios from "axios";
import jsonld from "jsonld";

// For optional Blazegraph saving
const SAVE_TO_BLAZEGRAPH = process.env.REACT_APP_SAVE_TO_BLAZEGRAPH === "true";

const BLAZEGRAPH_ENDPOINT = process.env.REACT_APP_BLAZEGRAPH_ENDPOINT;
if (!BLAZEGRAPH_ENDPOINT) {
  throw new Error(
    "REACT_APP_BLAZEGRAPH_ENDPOINT is not set in environment variables."
  );
}

/**
 * A base URI for your purl-based collection IDs.
 * We'll append an incremental number to this base.
 * Example: https://purl.archive.org/domain/lisa/annotation-collection/1
 */
const COLLECTION_BASE_URI =
  "https://purl.archive.org/domain/lisa/annotation-collection/";

/**
 * A default localStorage key for storing the entire Collection JSON
 * (Can still override this in the constructor if needed).
 */
const DEFAULT_COLLECTION_STORAGE_KEY = "myGlobalAnnotationCollection";

export default class AnnotationCollectionAdapter {
  /**
   * @param {string} [collectionId]  If provided, we use that exact URI for the collection.
   *                                 If omitted, we auto-generate a new one from COLLECTION_BASE_URI + counter.
   * @param {string} [storageKey]    localStorage key (default = "myGlobalAnnotationCollection").
   */
  constructor(collectionId, storageKey = DEFAULT_COLLECTION_STORAGE_KEY) {
    if (!collectionId) {
      // If no collectionId, generate an incremental ID each time this is constructed
      this.collectionId = this.generateNewCollectionId();
    } else {
      this.collectionId = collectionId;
    }

    this.storageKey = storageKey;
  }

  /**
   * Generate a new, unique URI by appending an incremental number
   * to the base PURL. E.g. "https://purl.archive.org/domain/lisa/annotation-collection/1"
   */
  generateNewCollectionId() {
    // 1) Read the current counter from localStorage, defaulting to 0
    const storedCount =
      localStorage.getItem("ANNOTATION_COLLECTION_COUNTER") || "0";
    const currentCount = parseInt(storedCount, 10);

    // 2) Increment by 1
    const newCount = currentCount + 1;

    // 3) Store the updated value back into localStorage
    localStorage.setItem("ANNOTATION_COLLECTION_COUNTER", String(newCount));

    // 4) Construct the final URI
    return `${COLLECTION_BASE_URI}${newCount}`;
  }

  /**
   * Get the existing AnnotationCollection from localStorage, or null if not found
   */
  async getCollection() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return null;
    return JSON.parse(data);
  }

  /**
   * If there's no collection in localStorage under this.storageKey, create a new one.
   * Return the collection (existing or newly created).
   */
  async initializeCollection() {
    let collection = await this.getCollection();

    if (!collection) {
      collection = {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: this.collectionId,
        type: "AnnotationCollection",
        label: { en: ["My Global Annotation Collection"] },
        summary: { en: ["Collects all annotation pages for local demos"] },
        // total = 0 or updated later
        items: [],
      };

      localStorage.setItem(this.storageKey, JSON.stringify(collection));
    }

    return collection;
  }

  /**
   * Add a reference to an AnnotationPage (pageId) to the Collection's 'items' array.
   */
  async addAnnotationPage(pageId) {
    const collection = await this.initializeCollection();
    const alreadyInCollection = collection.items.find((p) => p.id === pageId);

    if (!alreadyInCollection) {
      collection.items.push({
        id: pageId,
        type: "AnnotationPage",
      });
      // If you want to count the total # of pages, do: collection.total += 1;
      // If you want total to represent the # of Annotations, you'd need a separate summation.

      localStorage.setItem(this.storageKey, JSON.stringify(collection));
      await this.saveCollectionToBlazegraph(collection);
    }
    return collection;
  }

  /**
   * Remove a reference to an AnnotationPage from the Collection (if present).
   */
  async removeAnnotationPage(pageId) {
    const collection = await this.initializeCollection();
    const initialLen = collection.items.length;
    collection.items = collection.items.filter((p) => p.id !== pageId);

    if (collection.items.length < initialLen) {
      localStorage.setItem(this.storageKey, JSON.stringify(collection));
      await this.saveCollectionToBlazegraph(collection);
    }

    return collection;
  }

  /**
   * Convert the entire Collection to RDF and insert into Blazegraph (optional)
   */
  async saveCollectionToBlazegraph(collection) {
    if (!SAVE_TO_BLAZEGRAPH) return;
    try {
      const rdfData = await jsonld.toRDF(collection, {
        format: "application/n-quads",
      });
      const sparql = `INSERT DATA { ${rdfData} }`;
      await axios.post(BLAZEGRAPH_ENDPOINT, sparql, {
        headers: { "Content-Type": "application/sparql-update" },
      });
    } catch (err) {
      console.error("Error saving Collection to Blazegraph:", err);
    }
  }
}
