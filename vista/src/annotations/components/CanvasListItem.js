import React, { Component } from "react";
import PropTypes from "prop-types";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import flatten from "lodash/flatten";
import AnnotationActionsContext from "./AnnotationActionsContext";

class CanvasListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false, // Track whether the item is "open" (showing extra controls)
      isHovering: false,
    };

    // Bind methods
    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleMouseHover() {
    this.setState((prevState) => ({
      isHovering: !prevState.isHovering,
    }));
  }

  handleDelete() {
    const { annotationid } = this.props;
    const { canvases, receiveAnnotation, storageAdapter } = this.context;

    canvases.forEach((canvas) => {
      const adapter = storageAdapter(canvas.id);
      adapter.delete(annotationid).then((annoPage) => {
        receiveAnnotation(canvas.id, adapter.annotationPageId, annoPage);
      });
    });
  }

  handleEdit() {
    const { annotationid } = this.props;
    const { addCompanionWindow, canvases, annotationsOnCanvases } =
      this.context;
    let annotation;
    canvases.some((canvas) => {
      if (annotationsOnCanvases[canvas.id]) {
        Object.entries(annotationsOnCanvases[canvas.id]).forEach(
          ([, value]) => {
            if (value.json && value.json.items) {
              const found = value.json.items.find(
                (anno) => anno.id === annotationid
              );
              if (found) annotation = found;
            }
          }
        );
      }
      return !!annotation;
    });
    // Open the edit window with the selected annotation
    addCompanionWindow("annotationCreation", {
      annotationid,
      position: "right",
    });
  }

  // When the item is clicked, toggle open/closed state and dispatch a highlight action.
  handleClick() {
    const { annotationid } = this.props;
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));

    // Dispatch an action to set the selected annotation (for example, to highlight it)
    if (this.context && this.context.store) {
      this.context.store.dispatch({
        type: "SET_SELECTED_ANNOTATION",
        selectedAnnotationId: annotationid,
      });
    }
  }

  // Check whether the current user can edit this annotation
  editable() {
    const { annotationid } = this.props;
    const { annotationsOnCanvases, canvases } = this.context;
    const annoIds = canvases.map((canvas) => {
      if (annotationsOnCanvases[canvas.id]) {
        return flatten(
          Object.entries(annotationsOnCanvases[canvas.id]).map(([, value]) => {
            if (value.json && value.json.items) {
              return value.json.items.map((item) => item.id);
            }
            return [];
          })
        );
      }
      return [];
    });
    return flatten(annoIds).includes(annotationid);
  }

  render() {
    const { children, annotationid } = this.props;
    const { isHovering, isOpen } = this.state;
    const {
      windowViewType,
      toggleSingleCanvasDialogOpen,
      canvases,
      annotationsOnCanvases,
    } = this.context;

    // Retrieve the full annotation object from context data
    let annotation;
    canvases.some((canvas) => {
      const data = annotationsOnCanvases[canvas.id];
      if (!data) return false;
      Object.values(data).forEach((value) => {
        if (value.json && value.json.items) {
          const found = value.json.items.find((a) => a.id === annotationid);
          if (found) annotation = found;
        }
      });
      return !!annotation;
    });

    // Extract metadata
    const stageLabel = annotation?.hasStage?.label || "No Stage";
    const creatorName = annotation?.creator?.name || "Unknown";
    const interpretationCriterion =
      annotation?.wasGeneratedBy?.hasInterpretationCriterion.label || "";
    const expressionUri = annotation?.wasGeneratedBy?.isExtractedFrom?.id || "";
    // For recognition level, we assume the annotation carries a label in its anchor.
    const recognitionLevel =
      annotation?.hasAnchor?.hasConceptualLevel?.label || "Unknown";

    // Define stage colors using CSS variables (your CSS should define these)
    const stageColorMapping = {
      Draft: "var(--vista-anno-draft)",
      Published: "var(--vista-anno-published)",
      Deprecated: "var(--vista-anno-deprecated)",
      default: "var(--vista-gray)",
    };
    const stageColor =
      stageColorMapping[stageLabel] || stageColorMapping.default;

    // Define recognition level chip colors using CSS variables
    const recognitionColorMapping = {
      "Pre-Iconographical": "var(--vista-anno-preico-chip)",
      Iconographical: "var(--vista-anno-iconogra-chip)",
      Iconological: "var(--vista-anno-iconolo-chip)",
      default: "var(--vista-gray)",
    };
    const recognitionColor =
      recognitionColorMapping[recognitionLevel] ||
      recognitionColorMapping.default;

    // Similarly for border colors
    const recognitionBorderMapping = {
      "Pre-Iconographical": "var(--vista-anno-preico)",
      Iconographical: "var(--vista-anno-iconogra)",
      Iconological: "var(--vista-anno-iconolo)",
      default: "var(--vista-gray)",
    };
    const recognitionBorder =
      recognitionBorderMapping[recognitionLevel] ||
      recognitionBorderMapping.default;

    return (
      <div
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        onClick={this.handleClick}
        style={{ cursor: "pointer" }}
      >
        <li
          style={{
            borderLeft: `4px solid ${stageColor}`,
            marginLeft: "0.5rem",
            paddingLeft: "0.25rem",
          }}
          className="annotation-item"
        >
          <div className="flex p-2 text-sm justify-between items-center">
            <div className="font-light">{creatorName}</div>
            <div
              className="ml-2 px-2 py-1 text-vista-text"
              style={{
                borderRadius: "4px",
                border: `1px solid ${recognitionBorder}`,
                backgroundColor: recognitionColor,
              }}
            >
              {recognitionLevel}
            </div>
          </div>

          <div className="annotation-metadata body">{children}</div>

          {interpretationCriterion && (
            <div className="annotation-metadata criterion">
              <div>Interpretation Criterion:</div>
              <div>{interpretationCriterion}</div>
            </div>
          )}
          {expressionUri && (
            <div className="annotation-metadata cites">
              <div>Cites:</div>
              <div>{expressionUri}</div>
            </div>
          )}

          {isOpen && this.editable() && (
            <div
              // style={{
              //   position: "relative",
              //   top: -20,
              //   zIndex: 10000,
              // }}
              className=""
            >
              <ToggleButtonGroup aria-label="annotation tools" size="small">
                <ToggleButton
                  aria-label="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleEdit();
                  }}
                  value="edit"
                >
                  <EditIcon />
                </ToggleButton>
                <ToggleButton
                  aria-label="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleDelete();
                  }}
                  value="delete"
                >
                  <DeleteIcon />
                </ToggleButton>
                <ToggleButton
                  aria-label="Close"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle the open state to close the extra controls
                    this.handleClick();
                  }}
                  value="close"
                >
                  Close
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          )}
        </li>
      </div>
    );
  }
}

CanvasListItem.propTypes = {
  annotationid: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
};

CanvasListItem.contextType = AnnotationActionsContext;

export default CanvasListItem;
