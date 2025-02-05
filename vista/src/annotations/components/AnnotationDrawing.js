import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { OSDReferences } from "mirador/dist/es/src/plugins/OSDReferences";
import {
  renderWithPaperScope,
  PaperContainer,
} from "@psychobolt/react-paperjs";
import {
  EllipseTool,
  PolygonTool,
  RectangleTool,
  FreeformPathTool,
} from "@psychobolt/react-paperjs-editor";
import { Point } from "paper"; // Ensure paper.js is imported
import flatten from "lodash/flatten";
import EditTool from "../utils/EditTool";
import { mapChildren } from "../utils/utils";

class AnnotationDrawing extends Component {
  constructor(props) {
    super(props);
    this.paperScope = null;
    this.currentPath = null; // track current shape
    this.addPath = this.addPath.bind(this);
  }

  finalizeCurrentPath() {
    this.currentPath = null;
  }

  // componentDidMount() {
  //   const { windowId } = this.props;
  //   this.OSDReference = OSDReferences.get(windowId);
  //   console.log("DEBUG OSDReference:", this.OSDReference); // TEST
  //   console.log(
  //     "AnnotationDrawing: using portal target:",
  //     this.OSDReference.element
  //   ); // TEST
  // }

  componentDidMount() {
    const { windowId } = this.props;
    const osdRef = OSDReferences.get(windowId);
    if (osdRef && osdRef.current) {
      this.OSDReference = osdRef.current;
      console.log(
        "AnnotationDrawing: using portal target:",
        this.OSDReference.element
      );
    }
  }

  componentDidUpdate(prevProps) {
    const { fillColor } = this.props;
    if (fillColor !== prevProps.fillColor && this.currentPath) {
      // Update only the path currently being drawn
      this.currentPath.fillColor = fillColor;
    }
  }

  /**
   * Called when a new path is finished being drawn.
   */
  addPath(path) {
    const { closed, strokeWidth, updateGeometry, fillColor, strokeColor } =
      this.props;
    this.currentPath = path; // mark as "in-progress"

    path.closed = closed;
    path.strokeWidth = strokeWidth;

    // Apply the current fill color TO BE TESTED
    if (fillColor) path.fillColor = fillColor;
    if (strokeColor) path.strokeColor = strokeColor;

    const svgParts = [];
    path.project.layers.forEach((layer) => {
      flatten(mapChildren(layer)).forEach((subPath) => {
        console.log("DEBUG subPath fillColor:", subPath.fillColor);
        console.log("DEBUG subPath strokeColor:", subPath.strokeColor);
        // 1) Export as DOM element
        const svgElem = subPath.exportSVG({ asString: false });

        // 2) Convert fillColor = rgba(...) => fill + fill-opacity
        if (subPath.fillColor) {
          const { red, green, blue, alpha } = subPath.fillColor;
          const r255 = Math.round(red * 255);
          const g255 = Math.round(green * 255);
          const b255 = Math.round(blue * 255);
          svgElem.setAttribute("fill", `rgb(${r255}, ${g255}, ${b255})`);
          if (alpha < 1) {
            svgElem.setAttribute("fill-opacity", alpha);
          }
        }
        // Similarly for strokeColor

        // 3) Serialize back to string
        const pathStr = new XMLSerializer().serializeToString(svgElem);
        svgParts.push(pathStr);
      });
    });

    svgParts.unshift("<svg xmlns='http://www.w3.org/2000/svg'>");
    svgParts.push("</svg>");

    // Provide geometry to parent
    updateGeometry({
      svg: svgParts.join(""),
      xywh: [
        Math.floor(path.bounds.x),
        Math.floor(path.bounds.y),
        Math.floor(path.bounds.width),
        Math.floor(path.bounds.height),
      ].join(","),
    });
  }

  // This method is essentially the same logic you use in addPath(), but it runs
  // anytime you need to re-serialize the shapes to <svg> again.
  reExportPaths() {
    const { updateGeometry } = this.props;
    if (!this.paperScope) return;

    const svgParts = [];
    this.paperScope.project.layers.forEach((layer) => {
      flatten(mapChildren(layer)).forEach((subPath) => {
        console.log("DEBUG subPath fillColor:", subPath.fillColor);
        console.log("DEBUG subPath strokeColor:", subPath.strokeColor);
        // same code from addPath’s alpha fix approach
        const svgElem = subPath.exportSVG({ asString: false });

        // Fill color
        if (subPath.fillColor) {
          const { red, green, blue, alpha } = subPath.fillColor;
          const r255 = Math.round(red * 255);
          const g255 = Math.round(green * 255);
          const b255 = Math.round(blue * 255);
          svgElem.setAttribute("fill", `rgb(${r255}, ${g255}, ${b255})`);
          if (alpha < 1) svgElem.setAttribute("fill-opacity", alpha);
        }

        // Stroke color
        if (subPath.strokeColor) {
          const { red, green, blue, alpha } = subPath.strokeColor;
          const r255 = Math.round(red * 255);
          const g255 = Math.round(green * 255);
          const b255 = Math.round(blue * 255);
          svgElem.setAttribute("stroke", `rgb(${r255}, ${g255}, ${b255})`);
          if (alpha < 1) svgElem.setAttribute("stroke-opacity", alpha);
          if (subPath.strokeWidth) {
            svgElem.setAttribute("stroke-width", subPath.strokeWidth);
          }
        }

        const pathStr = new XMLSerializer().serializeToString(svgElem);
        svgParts.push(pathStr);
      });
    });
    svgParts.unshift("<svg xmlns='http://www.w3.org/2000/svg'>");
    svgParts.push("</svg>");

    // Update the parent
    updateGeometry({
      svg: svgParts.join(""),
      // optional: xywh if you want to keep bounding box updated
    });
  }

  /**
   * Export a single Paper.js path to an SVG string with alpha-friendly fill/stroke attributes.
   *
   * Paper.js can handle "rgba(...)" internally, but standard SVG needs
   * fill="rgb(r,g,b)" and fill-opacity="someAlpha".
   */
  exportPathWithAlphaFix(aPath) {
    // 1) Export as a DOM element (not a string)
    const svgElem = aPath.exportSVG({ asString: false });

    // 2) If the path has a fillColor, convert Paper.js color -> valid SVG fill + fill-opacity
    if (aPath.fillColor) {
      // paper.Color gives channels in [0..1]
      const { red, green, blue, alpha } = aPath.fillColor;
      const r255 = Math.round(red * 255);
      const g255 = Math.round(green * 255);
      const b255 = Math.round(blue * 255);
      // fill
      svgElem.setAttribute("fill", `rgb(${r255}, ${g255}, ${b255})`);
      // only set fill-opacity if alpha < 1
      if (alpha < 1) {
        svgElem.setAttribute("fill-opacity", alpha);
      }
    }

    // 3) If you also want to handle stroke alpha, do similarly:
    if (aPath.strokeColor) {
      const { red, green, blue, alpha } = aPath.strokeColor;
      const r255 = Math.round(red * 255);
      const g255 = Math.round(green * 255);
      const b255 = Math.round(blue * 255);
      svgElem.setAttribute("stroke", `rgb(${r255}, ${g255}, ${b255})`);
      if (alpha < 1) {
        svgElem.setAttribute("stroke-opacity", alpha);
      }
      // Also set the stroke-width if desired
      if (aPath.strokeWidth) {
        svgElem.setAttribute("stroke-width", aPath.strokeWidth);
      }
    }

    // 4) Convert DOM element back to a string
    const svgString = new XMLSerializer().serializeToString(svgElem);
    return svgString;
  }

  /**
   * Render the paper.js container with the chosen tool
   */
  paperThing() {
    const { activeTool, fillColor, strokeColor, strokeWidth, svg } = this.props;
    if (!activeTool || activeTool === "cursor") return null;

    // Sync Paper view with OSD
    const viewportZoom = this.OSDReference.viewport.getZoom(true);
    const image1 = this.OSDReference.world.getItemAt(0);
    const center = image1.viewportToImageCoordinates(
      this.OSDReference.viewport.getCenter(true)
    );
    const flipped = this.OSDReference.viewport.getFlip();

    const viewProps = {
      center: new Point(center.x, center.y),
      rotation: this.OSDReference.viewport.getRotation(),
      scaling: new Point(flipped ? -1 : 1, 1),
      zoom: image1.viewportToImageZoom(viewportZoom),
    };

    let ActiveTool = RectangleTool;
    switch (activeTool) {
      case "rectangle":
        ActiveTool = RectangleTool;
        break;
      case "ellipse":
        ActiveTool = EllipseTool;
        break;
      case "polygon":
        ActiveTool = PolygonTool;
        break;
      case "freehand":
        ActiveTool = FreeformPathTool;
        break;
      case "edit":
        ActiveTool = EditTool;
        break;
      default:
        break;
    }

    return (
      <div
        style={{
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      >
        <PaperContainer
          canvasProps={{ style: { height: "100%", width: "100%" } }}
          viewProps={viewProps}
        >
          {renderWithPaperScope((paper) => {
            this.paperScope = paper;

            // If we have existing SVG and no existing paths, import them
            const paths = flatten(
              paper.project.layers.map((layer) =>
                flatten(mapChildren(layer)).map((p) => p)
              )
            );
            if (svg && paths.length === 0) {
              paper.project.importSVG(svg);
            }

            paper.settings.handleSize = 10;
            paper.settings.hitTolerance = 10;

            return (
              <ActiveTool
                onPathAdd={this.addPath}
                pathProps={{
                  fillColor, // The color for new shapes
                  strokeColor,
                  strokeWidth: strokeWidth / paper.view.zoom,
                }}
                paper={paper}
              />
            );
          })}
        </PaperContainer>
      </div>
    );
  }

  // render() {
  //   const { windowId } = this.props;
  //   this.OSDReference = OSDReferences.get(windowId).current;
  //   return ReactDOM.createPortal(this.paperThing(), this.OSDReference.element);
  // }
  // render() {
  //   // Use cached target if available; otherwise try to get it now.
  //   const target =
  //     (this.OSDReference && this.OSDReference.element) ||
  //     OSDReferences.get(this.props.windowId)?.current?.element;
  //   if (!target) {
  //     return null;
  //   }
  //   return ReactDOM.createPortal(this.paperThing(), target);
  // }

  render() {
    // Get the OSD container element from the OSDReferences.
    const osdElement =
      (this.OSDReference && this.OSDReference.element) ||
      OSDReferences.get(this.props.windowId)?.current?.element;
    if (!osdElement) {
      return null;
    }

    // Check if a dedicated portal container already exists;
    // if not, create one and append it as a child of the OSD element.
    let portalContainer = osdElement.querySelector(
      "#annotation-drawing-portal"
    );
    if (!portalContainer) {
      portalContainer = document.createElement("div");
      portalContainer.id = "annotation-drawing-portal";
      // Optionally, you can style the container so it fills its parent
      portalContainer.style.width = "100%";
      portalContainer.style.height = "100%";
      // Append the new container to the OSD element.
      osdElement.appendChild(portalContainer);
    }

    // Render the PaperContainer (your paperThing) into this dedicated portal container.
    return ReactDOM.createPortal(this.paperThing(), portalContainer);
  }
}

AnnotationDrawing.propTypes = {
  activeTool: PropTypes.string,
  closed: PropTypes.bool,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  svg: PropTypes.string,
  updateGeometry: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationDrawing.defaultProps = {
  activeTool: null,
  closed: true,
  fillColor: null,
  strokeColor: "#F6F2F1",
  strokeWidth: 3,
  svg: null,
};

export default AnnotationDrawing;
