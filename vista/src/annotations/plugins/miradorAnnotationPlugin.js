import React, { Component } from "react";
import PropTypes from "prop-types";
import * as actions from "mirador/dist/es/src/state/actions";
import { getWindowViewType } from "mirador/dist/es/src/state/selectors";
// import AddBoxIcon from "@material-ui/icons/AddBox";
import GetAppIcon from "@material-ui/icons/GetApp";
import Add from "@material-ui/icons/Add";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import { getVisibleCanvases } from "mirador/dist/es/src/state/selectors/canvases";
import SingleCanvasDialog from "../components/SingleCanvasDialog";
import AnnotationExportDialog from "../components/AnnotationExportDialog";
import LocalStorageAdapter from "../adapters/LocalStorageAdapter";

class MiradorAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      annotationExportDialogOpen: false,
      singleCanvasDialogOpen: false,
    };
    this.openCreateAnnotationCompanionWindow =
      this.openCreateAnnotationCompanionWindow.bind(this);
    this.toggleCanvasExportDialog = this.toggleCanvasExportDialog.bind(this);
    this.toggleSingleCanvasDialogOpen =
      this.toggleSingleCanvasDialogOpen.bind(this);
  }

  openCreateAnnotationCompanionWindow(e) {
    const { addCompanionWindow } = this.props;

    addCompanionWindow("annotationCreation", {
      position: "right",
    });
  }

  toggleSingleCanvasDialogOpen() {
    const { singleCanvasDialogOpen } = this.state;
    this.setState({
      singleCanvasDialogOpen: !singleCanvasDialogOpen,
    });
  }

  toggleCanvasExportDialog(e) {
    const { annotationExportDialogOpen } = this.state;
    const newState = {
      annotationExportDialogOpen: !annotationExportDialogOpen,
    };
    this.setState(newState);
  }

  render() {
    const {
      canvases,
      config,
      switchToSingleCanvasView,
      TargetComponent,
      targetProps,
      windowViewType,
    } = this.props;
    const { annotationExportDialogOpen, singleCanvasDialogOpen } = this.state;
    const storageAdapter =
      config.annotation && config.annotation.adapter("poke");
    const offerExportDialog =
      config.annotation &&
      storageAdapter instanceof LocalStorageAdapter &&
      config.annotation.exportLocalStorageAnnotations;
    return (
      <div
        id="annotation-settings"
        className="flex items-center w-full justify-between mt-4"
      >
        <div>
          <span>
            <TargetComponent
              {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
            />
            {singleCanvasDialogOpen && (
              <SingleCanvasDialog
                open={singleCanvasDialogOpen}
                handleClose={this.toggleSingleCanvasDialogOpen}
                switchToSingleCanvasView={switchToSingleCanvasView}
              />
            )}
          </span>
          <span className="pl-2">
            {offerExportDialog && (
              <MiradorMenuButton
                aria-label="Export local annotations for visible items"
                onClick={this.toggleCanvasExportDialog}
                size="small"
              >
                <GetAppIcon />
              </MiradorMenuButton>
            )}
          </span>

          {offerExportDialog && (
            <AnnotationExportDialog
              canvases={canvases}
              config={config}
              handleClose={this.toggleCanvasExportDialog}
              open={annotationExportDialogOpen}
            />
          )}
        </div>
        <MiradorMenuButton
          aria-label="Create new annotation"
          onClick={
            windowViewType === "single"
              ? this.openCreateAnnotationCompanionWindow
              : this.toggleSingleCanvasDialogOpen
          }
          // size="small"
          className="hover:bg-none"
        >
          <div className="flex bg-vista-bordeaux text-white pl-3 pr-4 py-2 rounded-full hover:bg-vista-bordeaux-dark text-sm items-center">
            <div className="pr-2">
              <Add />
            </div>
            <div>New</div>
          </div>
        </MiradorMenuButton>
      </div>
    );
  }
}

MiradorAnnotation.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number })
  ).isRequired,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
      exportLocalStorageAnnotations: PropTypes.bool,
    }),
  }).isRequired,
  switchToSingleCanvasView: PropTypes.func.isRequired,
  TargetComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
    .isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  windowViewType: PropTypes.string.isRequired,
};

/** */
const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) =>
    dispatch(
      actions.addCompanionWindow(props.targetProps.windowId, {
        content,
        ...additionalProps,
      })
    ),
  switchToSingleCanvasView: () =>
    dispatch(actions.setWindowViewType(props.targetProps.windowId, "single")),
});

/** */
const mapStateToProps = (state, { targetProps: { windowId } }) => ({
  canvases: getVisibleCanvases(state, { windowId }),
  config: state.config,
  windowViewType: getWindowViewType(state, { windowId }),
});

const miradorAnnotationPlugin = {
  component: MiradorAnnotation,
  mapDispatchToProps,
  mapStateToProps,
  mode: "wrap",
  target: "AnnotationSettings", // Take the existing AnnotationSettings component in Mirador and wrap it with our custom MiradorAnnotation component.
};

export default miradorAnnotationPlugin;
