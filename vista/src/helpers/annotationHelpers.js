// A helper function to retrieve all annotations from localStorage
export const fetchAllAnnotations = () => {
  const annotations = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Assuming all keys are manifest URLs ending with '.json'
    if (key && key.endsWith(".json")) {
      try {
        const annotationPage = JSON.parse(localStorage.getItem(key));
        if (annotationPage && Array.isArray(annotationPage.items)) {
          annotations.push(...annotationPage.items);
        }
      } catch (error) {
        console.error(`Error parsing annotations for key ${key}:`, error);
      }
    }
  }

  return annotations;
};
