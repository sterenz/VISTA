//***************//

// This file contains helper functions to interact with localStorage for managing individual annotations:
//
// fetchAllAnnotations: Retrieves all annotations from localStorage.
// addAnnotation: Adds a new annotation to a specific annotation page in localStorage.
// deleteAnnotation: Deletes an annotation from a specific annotation page in localStorage.

//***************//

// A helper function to retrieve all annotations from localStorage
export const fetchAllAnnotations = () => {
  const annotations = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Adjusted to match keys ending with '.json/annotation-page'
    if (key && key.endsWith(".json/annotation-page")) {
      try {
        const annotationPage = JSON.parse(localStorage.getItem(key));
        if (annotationPage && Array.isArray(annotationPage.items)) {
          annotations.push(...annotationPage.items);
          console.log(
            `Fetched ${annotationPage.items.length} annotations from key: ${key}`
          );
        }
      } catch (error) {
        console.error(`Error parsing annotations for key ${key}:`, error);
      }
    }
  }

  return annotations;
};

export const addAnnotation = (manifestUrl, newAnnotation) => {
  console.log(
    `addAnnotation called with manifestUrl: ${manifestUrl} and annotation:`,
    newAnnotation
  );

  try {
    const annotationPage = JSON.parse(localStorage.getItem(manifestUrl)) || {
      items: [],
      type: "AnnotationPage",
    };
    annotationPage.items.push(newAnnotation);
    localStorage.setItem(manifestUrl, JSON.stringify(annotationPage));
    console.log(
      `Added annotation ${newAnnotation.id} to manifest ${manifestUrl}`
    );

    // Dispatch a custom event to notify about the update
    window.dispatchEvent(new Event("annotationsUpdated"));
  } catch (error) {
    console.error(`Error adding annotation to manifest ${manifestUrl}:`, error);
  }
};

export const deleteAnnotation = (manifestUrl, annoId) => {
  console.log(
    `deleteAnnotation called with manifestUrl: ${manifestUrl} and annoId: ${annoId}`
  );

  try {
    const annotationPage = JSON.parse(localStorage.getItem(manifestUrl));
    if (annotationPage && Array.isArray(annotationPage.items)) {
      const initialLength = annotationPage.items.length;
      annotationPage.items = annotationPage.items.filter(
        (item) => item.id !== annoId
      );
      console.log(`Deleted annotation from ${manifestUrl}`);
      if (annotationPage.items.length !== initialLength) {
        if (annotationPage.items.length === 0) {
          // Delete the annotation page if empty
          localStorage.removeItem(manifestUrl);
          console.log(
            `Deleted empty annotation page for manifest ${manifestUrl}`
          );
        } else {
          // Update the annotation page with the filtered items
          localStorage.setItem(manifestUrl, JSON.stringify(annotationPage));
          console.log(
            `Deleted annotation ${annoId} from manifest ${manifestUrl}`
          );
        }
        // Dispatch a custom event to notify about the update
        window.dispatchEvent(new Event("annotationsUpdated"));
      } else {
        console.warn(
          `Annotation with id ${annoId} not found in manifest ${manifestUrl}.`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error deleting annotation from manifest ${manifestUrl}:`,
      error
    );
  }
};
