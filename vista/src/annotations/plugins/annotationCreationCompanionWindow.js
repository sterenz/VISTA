import * as actions from "mirador/dist/es/src/state/actions";
import { getCompanionWindow } from "mirador/dist/es/src/state/selectors/companionWindows";
import { getVisibleCanvases } from "mirador/dist/es/src/state/selectors/canvases";
import AnnotationCreation from "../components/AnnotationCreation";

/** */
const mapDispatchToProps = (dispatch, { id, windowId }) => ({
  closeCompanionWindow: () =>
    dispatch(actions.removeCompanionWindow(windowId, id)),
  receiveAnnotation: (targetId, annoId, annotation) =>
    dispatch(actions.receiveAnnotation(targetId, annoId, annotation)),
});

/** */
function mapStateToProps(state, { id: companionWindowId, windowId }) {
  // Retrieve annotationid from the companion window's props in state
  const { annotationid } = getCompanionWindow(state, {
    companionWindowId,
    windowId,
  });

  // Get the canvases for this window
  const canvases = getVisibleCanvases(state, { windowId });

  // Brute-force search among all annotation pages
  let annotation = null;
  canvases.forEach((canvas) => {
    const annotationsOnCanvas = state.annotations[canvas.id];
    if (!annotationsOnCanvas) return;

    // each key in annotationsOnCanvas = annotationPageId
    // each value = { json: { items: [...] } }
    Object.values(annotationsOnCanvas).forEach((pageResource) => {
      if (pageResource.json && pageResource.json.items) {
        const found = pageResource.json.items.find(
          (anno) => anno.id === annotationid
        );
        if (found) annotation = found;
      }
    });
  });

  return {
    annotation, // This goes into props.annotation in AnnotationCreation
    canvases, // So we know which canvases to update
    config: state.config, // So AnnotationCreation can read config.annotation.adapter, etc.
  };
}

const annotationCreationConfig = {
  companionWindowKey: "annotationCreation", // or whichever key it's using
  component: AnnotationCreation,
  mapDispatchToProps,
  mapStateToProps,
};

export default annotationCreationConfig;
