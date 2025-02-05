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
      isHovering: false,
    };

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
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

  // This tells Mirador: “Open a companion window with the content type = annotationCreation and props = { annotationid, position: 'right' }.”
  handleEdit() {
    const { annotationid } = this.props;
    const { addCompanionWindow, canvases, annotationsOnCanvases } =
      this.context;
    let annotation;
    canvases.some((canvas) => {
      if (annotationsOnCanvases[canvas.id]) {
        Object.entries(annotationsOnCanvases[canvas.id]).forEach(
          ([key, value], i) => {
            if (value.json && value.json.items) {
              annotation = value.json.items.find(
                (anno) => anno.id === annotationid
              );
            }
          }
        );
      }
      return annotation;
    });
    // Now we have `annotation`. Then open the edit window:
    addCompanionWindow("annotationCreation", {
      annotationid,
      position: "right",
    });
  }

  // Checks if user can edit
  editable() {
    const { annotationid } = this.props;
    const { annotationsOnCanvases, canvases } = this.context;
    const annoIds = canvases.map((canvas) => {
      if (annotationsOnCanvases[canvas.id]) {
        return flatten(
          Object.entries(annotationsOnCanvases[canvas.id]).map(
            ([key, value], i) => {
              if (value.json && value.json.items) {
                return value.json.items.map((item) => item.id);
              }
              return [];
            }
          )
        );
      }
      return [];
    });
    return flatten(annoIds).includes(annotationid);
  }

  /** */
  render() {
    const { children, annotationid } = this.props;
    const { isHovering } = this.state;
    const {
      windowViewType,
      toggleSingleCanvasDialogOpen,
      canvases,
      annotationsOnCanvases,
    } = this.context;

    // 1) Retrieve the full annotation object (similar to handleEdit logic)
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

    // Extract stage

    const stageLabel = annotation?.hasStage?.label || "No Stage";

    // Create a small dictionary of stage => color
    let stageColor = "#DDD"; // default or fallback color
    switch (stageLabel) {
      case "Draft":
        stageColor = "#F3984B";
        break;
      case "Published":
        stageColor = "#398884";
        break;
      case "Deprecated":
        stageColor = "#9F9F9F";
        break;
      // Add more cases if needed
      default:
        stageColor = "#AAA";
    }

    // Extract the fields
    const creatorName = annotation?.creator?.name || "Unknown";
    // const stageLabel = annotation?.hasStage?.label || "No Stage";
    const interpretationCriterion =
      annotation?.wasGeneratedBy?.hasInterpretationCriterion.label || "";

    const expressionUri = annotation?.wasGeneratedBy?.isExtractedFrom?.id || "";

    // add more as needed

    return (
      <div
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
      >
        {isHovering && this.editable() && (
          <div
            style={{
              position: "relative",
              top: -20,
              zIndex: 10000,
            }}
          >
            <ToggleButtonGroup
              aria-label="annotation tools"
              size="small"
              style={{
                position: "absolute",
                right: 0,
              }}
            >
              <ToggleButton
                aria-label="Edit"
                onClick={
                  windowViewType === "single"
                    ? this.handleEdit
                    : toggleSingleCanvasDialogOpen
                }
                value="edit"
              >
                <EditIcon />
              </ToggleButton>
              <ToggleButton
                aria-label="Delete"
                onClick={this.handleDelete}
                value="delete"
              >
                <DeleteIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        )}
        <li
          {...this.props}
          style={{
            borderLeft: `4px solid ${stageColor}`,
            marginLeft: "0.5rem",
            paddingLeft: "0.25rem",
          }}
          className="annotation-item"
        >
          {/* 3) Display extra metadata after the children */}
          {/* The default body content that Mirador passes as children */}

          <div className="annotation-metadata creator">
            <span className="MuiTypography-root MuiTypography-overline">
              {creatorName}
            </span>
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
