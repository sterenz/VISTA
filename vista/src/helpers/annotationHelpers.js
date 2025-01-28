// A helper function to retrieve all annotations from localStorage
export const fetchAllAnnotations = () => {
  const annotations = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Adjusted to match keys ending with '.json'
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
