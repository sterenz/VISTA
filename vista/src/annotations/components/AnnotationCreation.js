import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Popover,
  ClickAwayListener,
  MenuList,
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Autocomplete from "@material-ui/lab/Autocomplete";

import {
  Person as PersonIcon,
  CheckBoxOutlineBlank as RectangleIcon,
  RadioButtonUnchecked as CircleIcon,
  Timeline as PolygonIcon,
  Gesture as GestureIcon,
  ChangeHistory as ClosedPolygonIcon,
  ShowChart as OpenPolygonIcon,
  FormatColorFill as FormatColorFillIcon,
  BorderColor as StrokeColorIcon,
  LineWeight as LineWeightIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FormatShapes as FormatShapesIcon,
} from "@material-ui/icons";

import { SketchPicker } from "react-color";
import { v4 as uuid } from "uuid";
import { withStyles } from "@material-ui/core/styles";
import CompanionWindow from "mirador/dist/es/src/containers/CompanionWindow";
import AnnotationDrawing from "./AnnotationDrawing";
import TextEditor from "./TextEditor";
import WebAnnotation from "./WebAnnotation";

class AnnotationCreation extends Component {
  constructor(props) {
    console.log("PROPS --->", props);
    super(props);

    // Create a ref to access AnnotationDrawing's instance methods
    this.annotationDrawingRef = React.createRef();

    const annoState = {};
    if (props.annotation) {
      if (Array.isArray(props.annotation.body)) {
        annoState.tags = [];
        props.annotation.body.forEach((body) => {
          if (body.purpose === "tagging") {
            annoState.tags.push(body.value);
          } else {
            annoState.annoBody = body.value;
          }
        });
      } else {
        annoState.annoBody = props.annotation.body.value;
      }
      if (props.annotation.target.selector) {
        if (Array.isArray(props.annotation.target.selector)) {
          props.annotation.target.selector.forEach((selector) => {
            if (selector.type === "SvgSelector") {
              annoState.svg = selector.value;
            } else if (selector.type === "FragmentSelector") {
              annoState.xywh = selector.value.replace("xywh=", "");
            }
          });
        } else {
          annoState.svg = props.annotation.target.selector.value;
        }
      }
    }

    const toolState = {
      activeTool: "cursor",
      closedMode: "closed",
      currentColorType: false,
      fillColor: null,
      strokeColor: "#00BFFF",
      strokeWidth: 3,
      ...(props.config.annotation.defaults || {}),
    };

    this.state = {
      ...toolState,
      conceptualLevel: "Iconographical", // Default selection
      entityOptions: ["Manuscript Vat.gr.984", "Manuscript Vat.gr.985"],
      entityValue: "",
      authorOptions: ["D. Surace", "M. F. Bocchi"],
      authorValue: "",
      criterionOptions: ["Diplomatic Transcription", "Paleographic Analysis"],
      criterionValue: "",
      interpretationTypeOptions: ["Type A", "Type B", "Type C"], // New Field
      interpretationTypeValue: "", // New Field
      expressionUri: "", // New Field
      stageOptions: ["Draft", "Published", "Deprecated"], // New Field
      stageValue: "Draft", // New Field
      annoBody: "",
      colorPopoverOpen: false,
      lineWeightPopoverOpen: false,
      popoverAnchorEl: null,
      popoverLineWeightAnchorEl: null,
      svg: null,
      textEditorStateBustingKey: 0,
      xywh: null,
      ...annoState,
    };

    // Initialize fillColor based on default conceptualLevel
    this.initializeFillColor();

    // Bind all handler methods
    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.changeClosedMode = this.changeClosedMode.bind(this);
    this.openChooseColor = this.openChooseColor.bind(this);
    this.openChooseLineWeight = this.openChooseLineWeight.bind(this);
    this.handleLineWeightSelect = this.handleLineWeightSelect.bind(this);
    this.handleCloseLineWeight = this.handleCloseLineWeight.bind(this);
    this.closeChooseColor = this.closeChooseColor.bind(this);
    this.updateStrokeColor = this.updateStrokeColor.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleEntityChange = this.handleEntityChange.bind(this);
    this.handleCreatorChange = this.handleCreatorChange.bind(this); // Renamed Handler
    this.handleCriterionChange = this.handleCriterionChange.bind(this);
    this.handleInterpretationTypeChange =
      this.handleInterpretationTypeChange.bind(this); // New Handler
    this.handleExpressionUriChange = this.handleExpressionUriChange.bind(this); // New Handler
    this.handleStageChange = this.handleStageChange.bind(this); // New Handler
  }

  componentDidMount() {
    console.log("Editing Annotation:", this.props.annotation);

    // Set fillColor based on initial conceptualLevel
    this.setFillColor(this.state.conceptualLevel);
  }

  initializeFillColor() {
    // Initialize fillColor based on the default conceptualLevel
    this.setFillColor(this.state.conceptualLevel);
  }

  setFillColor(conceptualLevel) {
    let fillColor = "#FFFFFF"; // Default fill color
    switch (conceptualLevel) {
      case "Pre-Iconographical":
        fillColor = "rgba(255, 0, 0, 0.3)"; // Red-ish
        break;
      case "Iconographical":
        fillColor = "rgba(0, 255, 0, 0.3)"; // Green-ish
        break;
      case "Iconological":
        fillColor = "rgba(0, 0, 255, 0.3)"; // Blue-ish
        break;
      default:
        fillColor = "rgba(255, 255, 255, 0.3)"; // White-ish
    }
    this.setState({ fillColor });
  }

  handleInterpretationTypeChange(event, newValue) {
    const { interpretationTypeOptions } = this.state;
    if (newValue && !interpretationTypeOptions.includes(newValue)) {
      this.setState({
        interpretationTypeOptions: [...interpretationTypeOptions, newValue],
        interpretationTypeValue: newValue,
      });
    } else {
      this.setState({ interpretationTypeValue: newValue });
    }
  }

  handleExpressionUriChange(event) {
    this.setState({ expressionUri: event.target.value });
  }

  handleStageChange(event) {
    const newStage = event.target.value;
    let newStrokeColor = this.state.strokeColor; // Default to current color

    // Change stroke color based on stage
    switch (newStage) {
      case "Draft":
        newStrokeColor = "#FFA500"; // Orange
        break;
      case "Published":
        newStrokeColor = "#008000"; // Green
        break;
      case "Deprecated":
        newStrokeColor = "#FF0000"; // Red
        break;
      default:
        break;
    }

    this.setState({
      stageValue: newStage,
      strokeColor: newStrokeColor,
    });
  }

  handleCloseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
    });
  }

  handleLineWeightSelect(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
      strokeWidth: e.currentTarget.value,
    });
  }

  openChooseColor(e) {
    this.setState({
      colorPopoverOpen: true,
      currentColorType: e.currentTarget.value,
      popoverAnchorEl: e.currentTarget,
    });
  }

  openChooseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: true,
      popoverLineWeightAnchorEl: e.currentTarget,
    });
  }

  closeChooseColor(e) {
    this.setState({
      colorPopoverOpen: false,
      currentColorType: null,
      popoverAnchorEl: null,
    });
  }

  updateStrokeColor(color) {
    const { currentColorType } = this.state;
    this.setState({
      [currentColorType]: color.hex,
    });
  }

  submitForm(e) {
    e.preventDefault();
    const { annotation, canvases, receiveAnnotation, config } = this.props;
    const {
      annoBody,
      tags,
      xywh,
      svg,
      conceptualLevel,
      entityValue,
      authorValue,
      criterionValue,
      interpretationTypeValue,
      expressionUri,
      stageValue,
      fillColor,
      strokeColor,
      strokeWidth,
      textEditorStateBustingKey,
    } = this.state;

    // Debug check: show final exported SVG
    console.log("Submitting annotation with SVG:", svg);

    canvases.forEach((canvas) => {
      const storageAdapter = config.annotation.adapter(canvas.id);
      const anno = new WebAnnotation({
        body: annoBody,
        canvasId: canvas.id,
        id: (annotation && annotation.id) || `urn:uuid:${uuid()}`,
        manifestId: canvas.options.resource.id,
        svg,
        tags,
        xywh,
        wasGeneratedBy: {
          id: `https://purl.archive.org/domain/mlao/interpretation/${uuid()}`,
          type: "hico:InterpretationAct",
          hasInterpretationCriterion: {
            id: `https://purl.archive.org/domain/mlao/interpretation/criterion/${criterionValue
              .toLowerCase()
              .replaceAll(" ", "-")}`,
            type: "hico:InterpretationCriterion",
          },
          isExtractedFrom: expressionUri
            ? {
                id: expressionUri, // Assuming the user pastes a valid URI
                type: "lrm:F2_Expression",
              }
            : "",
        },
        creator: authorValue
          ? {
              id: `https://purl.archive.org/domain/mlao/creator/${authorValue
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll(".", "")}`,
              type: "foaf:Person",
              name: `${authorValue}`,
            }
          : "",
        hasConceptualLevel: {
          id: `https://purl.archive.org/domain/mlao/conceptualLevel/${conceptualLevel
            .toLowerCase()
            .replaceAll(" ", "-")}`,
          type: conceptualLevel, // e.g., "IconographicalRecognition"
        },
        interpretationType: interpretationTypeValue
          ? {
              id: `https://purl.archive.org/domain/mlao/interpretation/type/${interpretationTypeValue
                .toLowerCase()
                .replaceAll(" ", "-")}`,
              type: "hico:InterpretationType",
              label: interpretationTypeValue,
            }
          : "",
        hasStage: stageValue
          ? {
              id: `https://purl.archive.org/domain/mlao/stage/${stageValue.toLowerCase()}`,
              type: "lisa:PublishingStage",
              label: stageValue,
            }
          : "",
        fillColor, // Added fillColor
        strokeColor, // Added strokeColor
        strokeWidth, // Added strokeWidth
      }).toJson();
      if (annotation) {
        storageAdapter.update(anno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      } else {
        storageAdapter.create(anno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      }
    });

    this.setState({
      annoBody: "",
      svg: null,
      textEditorStateBustingKey: textEditorStateBustingKey + 1,
      xywh: null,
      interpretationTypeValue: "",
      expressionUri: "",
      stageValue: "Draft", // Reset to default stage
      // Optionally reset fillColor if needed
      // fillColor: null,
    });

    // **HERE** is where we finalize the path, so color changes won't affect it later
    if (this.annotationDrawingRef?.current) {
      this.annotationDrawingRef.current.finalizeCurrentPath();
    }
  }

  changeTool(e, tool) {
    this.setState({
      activeTool: tool,
    });
  }

  changeClosedMode(e) {
    this.setState({
      closedMode: e.currentTarget.value,
    });
  }

  updateBody(annoBody) {
    this.setState({ annoBody });
  }

  updateGeometry({ svg, xywh }) {
    this.setState({
      svg,
      xywh,
    });
  }

  handleChange(event) {
    const selectedLevel = event.target.value;
    this.setState({ conceptualLevel: selectedLevel }, () => {
      this.setFillColor(selectedLevel);
    });
  }

  handleEntityChange(event, newValue) {
    const { entityOptions } = this.state;
    if (newValue && !entityOptions.includes(newValue)) {
      this.setState({
        entityOptions: [...entityOptions, newValue],
        entityValue: newValue,
      });
    } else {
      this.setState({ entityValue: newValue });
    }
  }

  handleCreatorChange(event, newValue) {
    const { authorOptions } = this.state;
    if (newValue && !authorOptions.includes(newValue)) {
      this.setState({
        authorOptions: [...authorOptions, newValue],
        authorValue: newValue,
      });
    } else {
      this.setState({ authorValue: newValue });
    }
  }

  handleCriterionChange(event, newValue) {
    const { criterionOptions } = this.state;
    if (newValue && !criterionOptions.includes(newValue)) {
      this.setState({
        criterionOptions: [...criterionOptions, newValue],
        criterionValue: newValue,
      });
    } else {
      this.setState({ criterionValue: newValue });
    }
  }

  render() {
    const { annotation, classes, closeCompanionWindow, id, windowId } =
      this.props;

    const {
      entityOptions,
      entityValue,
      authorOptions,
      authorValue,
      criterionOptions,
      criterionValue,
      interpretationTypeOptions,
      interpretationTypeValue,
      expressionUri,
      stageOptions,
      stageValue,
      activeTool,
      colorPopoverOpen,
      currentColorType,
      fillColor,
      popoverAnchorEl,
      strokeColor,
      popoverLineWeightAnchorEl,
      lineWeightPopoverOpen,
      strokeWidth,
      closedMode,
      annoBody,
      svg,
      textEditorStateBustingKey,
    } = this.state;

    return (
      <CompanionWindow
        title={annotation ? "Edit annotation" : "New annotation"}
        windowId={windowId}
        id={id}
      >
        <AnnotationDrawing
          ref={this.annotationDrawingRef} // <-- pass the ref here
          activeTool={activeTool}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          closed={closedMode === "closed"}
          svg={svg}
          updateGeometry={this.updateGeometry}
          windowId={windowId}
        />
        <form onSubmit={this.submitForm} className={classes.section}>
          {/* Target Tools */}
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Target</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} className={classes.paper}>
                <ToggleButtonGroup
                  className={classes.grouped}
                  value={activeTool}
                  exclusive
                  onChange={this.changeTool}
                  aria-label="tool selection"
                  size="small"
                  classes={{ grouped: classes.toggleButtonSmall }}
                >
                  <ToggleButton value="cursor" aria-label="select cursor">
                    <PersonIcon />{" "}
                    {/* Replace with your actual CursorIcon if available */}
                  </ToggleButton>
                  <ToggleButton value="edit" aria-label="edit tool">
                    <FormatShapesIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <Divider
                  flexItem
                  orientation="vertical"
                  className={classes.divider}
                />
                <ToggleButtonGroup
                  className={classes.grouped}
                  value={activeTool}
                  exclusive
                  onChange={this.changeTool}
                  aria-label="tool selection"
                  size="small"
                  classes={{ grouped: classes.toggleButtonSmall }}
                >
                  <ToggleButton value="rectangle" aria-label="add a rectangle">
                    <RectangleIcon />
                  </ToggleButton>
                  <ToggleButton value="ellipse" aria-label="add a circle">
                    <CircleIcon />
                  </ToggleButton>
                  <ToggleButton value="polygon" aria-label="add a polygon">
                    <PolygonIcon />
                  </ToggleButton>
                  <ToggleButton value="freehand" aria-label="free hand polygon">
                    <GestureIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Paper>
            </Grid>
          </Grid>

          {/* Style Tools */}
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Style</Typography>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup
                className={classes.grouped}
                aria-label="style selection"
                size="small"
                classes={{ grouped: classes.toggleButtonSmall }}
              >
                <ToggleButton
                  value="strokeColor"
                  aria-label="select stroke color"
                  onClick={this.openChooseColor}
                >
                  <StrokeColorIcon style={{ fill: strokeColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="strokeWidth"
                  aria-label="select line weight"
                  onClick={this.openChooseLineWeight}
                >
                  <LineWeightIcon />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="fillColor"
                  aria-label="select fill color"
                  onClick={this.openChooseColor}
                >
                  <FormatColorFillIcon style={{ fill: fillColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider
                flexItem
                orientation="vertical"
                className={classes.divider}
              />
              {
                /* Close/Open polygon mode only for freehand drawing mode. */
                activeTool === "freehand" ? (
                  <ToggleButtonGroup
                    size="small"
                    value={closedMode}
                    onChange={this.changeClosedMode}
                  >
                    <ToggleButton value="closed" aria-label="closed polygon">
                      <ClosedPolygonIcon />
                    </ToggleButton>
                    <ToggleButton value="open" aria-label="open polygon">
                      <OpenPolygonIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : null
              }
            </Grid>
          </Grid>

          {/* Level of Recognition */}
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Level of Recognition</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Select
                  labelId="conceptual-level-label"
                  id="conceptual-level-select"
                  value={this.state.conceptualLevel}
                  onChange={this.handleChange}
                  autoWidth
                  label="Conceptual Level"
                >
                  <MenuItem value={"Pre-Iconographical"}>
                    Pre-Iconographical Recognition
                  </MenuItem>
                  <MenuItem value={"Iconographical"}>
                    Iconographical Recognition
                  </MenuItem>
                  <MenuItem value={"Iconological"}>
                    Iconological Recognition
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider
            flexItem
            orientation="horizontal"
            className={classes.divider}
          />

          {/* Interpretation Fields */}
          <Grid container spacing={2}>
            {/* Interpretative Criterion */}
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                size="small"
                value={criterionValue}
                onChange={this.handleCriterionChange}
                options={criterionOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Interpretative Criterion"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />

            {/* Expression URI */}
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="Expression URI"
                fullWidth
                value={expressionUri}
                onChange={this.handleExpressionUriChange}
                placeholder="https://example.org/expressions/12345"
              />
            </Grid>

            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />

            {/* Creator */}
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                size="small"
                value={authorValue}
                onChange={this.handleCreatorChange}
                options={authorOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Creator"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />

            {/* Interpretation Type */}
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                size="small"
                value={interpretationTypeValue}
                onChange={this.handleInterpretationTypeChange}
                options={interpretationTypeOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Interpretation Type"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />

            {/* Stage Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Select
                  labelId="stage-label"
                  id="stage-select"
                  value={stageValue}
                  onChange={this.handleStageChange}
                  autoWidth
                  label="Stage"
                >
                  {stageOptions.map((stage) => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider
            flexItem
            orientation="horizontal"
            className={classes.divider}
          />

          {/* Content */}
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Content</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextEditor
                key={textEditorStateBustingKey}
                annoHtml={annoBody}
                updateAnnotationBody={this.updateBody}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item>
              <Button onClick={closeCompanionWindow}>Cancel</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Popover for Line Weight */}
        <Popover
          open={lineWeightPopoverOpen}
          anchorEl={popoverLineWeightAnchorEl}
        >
          <Paper>
            <ClickAwayListener onClickAway={this.handleCloseLineWeight}>
              <MenuList autoFocus role="listbox">
                {[1, 3, 5, 10, 50].map((option) => (
                  <MenuItem
                    key={option}
                    onClick={this.handleLineWeightSelect}
                    value={option}
                    selected={option == strokeWidth}
                    role="option"
                    aria-selected={option == strokeWidth}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>

        {/* Popover for Color Picker */}
        <Popover
          open={colorPopoverOpen}
          anchorEl={popoverAnchorEl}
          onClose={this.closeChooseColor}
        >
          <SketchPicker
            color={this.state[currentColorType] || {}}
            onChangeComplete={this.updateStrokeColor}
          />
        </Popover>
      </CompanionWindow>
    );
  }
}

/** Styles */
const styles = (theme) => ({
  divider: {
    margin: theme.spacing(1, 0.5),
  },
  grouped: {
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    border: "none",
    margin: theme.spacing(0.5),
  },
  paper: {
    display: "flex",
    flexWrap: "wrap",
  },
  toggleButtonSmall: {
    // Custom class name for targeting ToggleButtons specifically
    padding: 1.2,
    fontSize: "0.8125rem",
  },
  toggleButton: {
    // Custom class name for targeting ToggleButtons specifically
    padding: 1.2,
    fontSize: "0.8125rem",
  },
  section: {
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
});

/** Prop Types */
AnnotationCreation.propTypes = {
  annotation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number })
  ),
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  closeCompanionWindow: PropTypes.func,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
      defaults: PropTypes.objectOf(
        PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.func,
          PropTypes.number,
          PropTypes.string,
        ])
      ),
    }),
  }).isRequired,
  id: PropTypes.string.isRequired,
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

/** Default Props */
AnnotationCreation.defaultProps = {
  annotation: null,
  canvases: [],
  closeCompanionWindow: () => {},
};

export default withStyles(styles)(AnnotationCreation);
