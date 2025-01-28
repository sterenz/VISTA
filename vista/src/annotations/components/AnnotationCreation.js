import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import RectangleIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CircleIcon from "@material-ui/icons/RadioButtonUnchecked";
import PolygonIcon from "@material-ui/icons/Timeline";
import GestureIcon from "@material-ui/icons/Gesture";
import ClosedPolygonIcon from "@material-ui/icons/ChangeHistory";
import OpenPolygonIcon from "@material-ui/icons/ShowChart";
import FormatColorFillIcon from "@material-ui/icons/FormatColorFill";
import StrokeColorIcon from "@material-ui/icons/BorderColor";
import LineWeightIcon from "@material-ui/icons/LineWeight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
//import FormatShapesIcon from "@material-ui/icons/FormatShapes";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Popover from "@material-ui/core/Popover";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import { SketchPicker } from "react-color";
import { v4 as uuid } from "uuid";
import { withStyles } from "@material-ui/core/styles";
import CompanionWindow from "mirador/dist/es/src/containers/CompanionWindow";
import AnnotationDrawing from "./AnnotationDrawing";
import TextEditor from "./TextEditor";
import WebAnnotation from "./WebAnnotation";
import CursorIcon from "../icons/Cursor";

/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    console.log("PROPS --->", props);
    super(props);
    console.log("[DEBUG] Received annotation:", props.annotation);

    // Bind addInterpretation in Constructor
    this.addInterpretation = this.addInterpretation.bind(this);

    // NEW: Default form state
    this.state = {
      recognitionValue: "",
      creatorValue: "",
      criterionValue: "",
      interpretationTypeValue: "",
      stageValue: "",
      expressionUri: "",
      fillColor: null,
      svg: null,
      annoBody: "",
      isForked: false,
      forkOriginalId: null,
      // plus any defaults...
    };

    // Create a ref to access AnnotationDrawing's instance methods
    this.annotationDrawingRef = React.createRef();

    const annoState = {};

    if (props.annotation) {
      console.log("FIRST DEBUG annotation => ", props.annotation);

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
        }
        // if (props.annotation.recognitionValue) {
        //   annoState.recognitionValue = props.annotation.recognitionValue;
        // }
        if (props.annotation.fillColor) {
          annoState.fillColor = props.annotation.fillColor;
        } else {
          annoState.svg = props.annotation.target.selector.value;
        }
      }
    }

    // NEW: If editing an existing annotation:
    if (props.annotation) {
      console.log("DEBUG annotation => ", props.annotation);

      const { annotation } = props;

      // Body text
      if (annotation.body?.value) {
        annoState.annoBody = annotation.body.value;
      }
      // Creator
      if (annotation.creator?.name) {
        annoState.creatorValue = annotation.creator.name;
      }

      // Recognition
      if (annotation.hasAnchor?.hasConceptualLevel?.type) {
        const levelType = annotation.hasAnchor.hasConceptualLevel.type;
        annoState.recognitionValue = levelType;

        // Also pick a color if you want the shape to be recolored
        if (levelType === "Pre-Iconographical") {
          annoState.fillColor = "rgba(255,0,0,0.2)";
        } else if (levelType === "Iconographical") {
          annoState.fillColor = "rgba(0,255,0,0.2)";
        } else if (levelType === "Iconological") {
          annoState.fillColor = "rgba(0,0,255,0.2)";
        }
        // etc.
      }

      // Interpretation Criterion
      if (
        annotation.wasGeneratedBy &&
        annotation.wasGeneratedBy.hasInterpretationCriterion
      ) {
        // If each criterion has an ID like "...criterion/bibliography"
        // we might parse the last segment or do a safe fallback:
        const critId = annotation.wasGeneratedBy.hasInterpretationCriterion.id;
        const lastSlash = critId.lastIndexOf("/");
        const critName = critId.substring(lastSlash + 1);
        annoState.criterionValue = critName;
      }

      // Stage
      if (annotation.hasStage?.label) {
        annoState.stageValue = annotation.hasStage.label;
      }

      // Expression URI, if stored
      if (
        annotation.wasGeneratedBy &&
        annotation.wasGeneratedBy.isExtractedFrom
      ) {
        annoState.expressionUri = annotation.wasGeneratedBy.isExtractedFrom.id;
      }

      // Existing geometry (SVG) => update 'svg'
      if (
        annotation.target &&
        annotation.target.selector &&
        annotation.target.selector.type === "SvgSelector"
      ) {
        annoState.svg = annotation.target.selector.value;
      }

      // Interpretation Type //TODO: UNDERSTAND IF NEEDED AND IN CASE FIX IT IN EDIT
      if (annotation.interpretationTypeValue?.label) {
        annoState.interpretationTypeValue =
          annotation.interpretationTypeValue.label;
      }

      // etc. parse any other fields needed
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
      recognitionOptions: [
        "Pre-Iconographical",
        "Iconographical",
        "Iconological",
      ], // New Field
      recognitionValue: "", // New Field
      entityOptions: ["Manuscript Vat.gr.984", "Manuscript Vat.gr.985"],
      entityValue: "",
      creatorOptions: ["D. Surace", "M. F. Bocchi"],
      creatorValue: "",
      criterionOptions: [
        "Bibliography",
        "Paleographic Analysis",
        "Auction Attribution",
      ],
      criterionValue: "",
      interpretationTypeOptions: ["Type A", "Type B", "Type C"], // New Field
      interpretationTypeValue: "", // New Field
      expressionUri: "", // New Field
      stageOptions: ["Draft", "Published", "Deprecated"], // New Field
      stageValue: "", // New Field
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
    this.handleEntityChange = this.handleEntityChange.bind(this);
    this.handleCreatorChange = this.handleCreatorChange.bind(this);
    this.handleCriterionChange = this.handleCriterionChange.bind(this);
    this.handleInterpretationTypeChange =
      this.handleInterpretationTypeChange.bind(this);
    this.handleExpressionUriChange = this.handleExpressionUriChange.bind(this);
    this.handleStageChange = this.handleStageChange.bind(this);
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
      isForked,
      forkOriginalId,
      annoBody,
      tags,
      xywh,
      svg,
      recognitionValue,
      entityValue,
      creatorValue,
      criterionValue,
      interpretationTypeValue,
      expressionUri,
      stageValue,
      textEditorStateBustingKey,
    } = this.state;

    const creationTime = new Date().toISOString(); // Add creationTime

    // Debug check: show final exported SVG
    console.log("Submitting annotation with SVG:", svg);

    canvases.forEach((canvas) => {
      const annotationPageId = `${canvas.id}`;
      const storageAdapter = config.annotation.adapter(annotationPageId);

      let newAnno;
      if (isForked) {
        // We are creating a brand-new annotation that "disagrees with" the old one
        newAnno = new WebAnnotation({
          // new ID
          id: `urn:uuid:${uuid()}`,
          created: { value: creationTime, type: "xsd:dateTime" },
          canvasId: canvas.id,
          manifestId: canvas.options.resource.id,
          svg,
          xywh,
          //fillColor,
          body: annoBody,
          // Possibly pass new interpretation fields
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
                  id: expressionUri,
                  type: "lrm:F2_Expression",
                }
              : "",
          },
          creator: creatorValue
            ? {
                id: `https://purl.archive.org/domain/mlao/creator/${creatorValue
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replaceAll(".", "")}`,
                type: "foaf:Person",
                name: `${creatorValue}`,
              }
            : "",
          hasAnchor: {
            label: `Recognition Level: ${recognitionValue}`,
            id: `https://purl.archive.org/domain/mlao/anchor/${uuid()}`,
            type: "mlao:Anchor",
            hasConceptualLevel: {
              id: `https://purl.archive.org/domain/mlao/${recognitionValue}/${uuid()
                .toLowerCase()
                .replaceAll(" ", "-")}`,
              type: recognitionValue,
            },
            isAnchoredTo: `https://purl.archive.org/domain/mlao/${entityValue
              .toLowerCase()
              .replaceAll(" ", "-")
              .replaceAll(".", "")}`,
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
                id: `https://purl.archive.org/domain/mlao/stage/${stageValue
                  .toLowerCase()
                  .replaceAll(" ", "-")}`,
                type: "lisa:PublishingStage",
                label: stageValue,
              }
            : "",
          // The "disagreeWith" link
          disagreeWith: forkOriginalId, // or cito:disagreesWith, if context is set
        }).toJson();
      } else {
        // Normal update or creation of the existing annotation
        newAnno = new WebAnnotation({
          body: annoBody,
          created: { value: creationTime, type: "xsd:dateTime" },
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
          creator: creatorValue
            ? {
                id: `https://purl.archive.org/domain/mlao/creator/${creatorValue
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replaceAll(".", "")}`,
                type: "foaf:Person",
                name: `${creatorValue}`,
              }
            : "",
          hasAnchor: {
            label: `Recognition Level: ${recognitionValue}`,
            id: `https://purl.archive.org/domain/mlao/anchor/${uuid()}`,
            type: "mlao:Anchor",
            hasConceptualLevel: {
              id: `https://purl.archive.org/domain/mlao/${recognitionValue}/${uuid()
                .toLowerCase()
                .replaceAll(" ", "-")}`,
              type: recognitionValue, // e.g., "Iconographical"
            },
            isAnchoredTo: `https://purl.archive.org/domain/mlao/${entityValue
              .toLowerCase()
              .replaceAll(" ", "-")
              .replaceAll(".", "")}`, // TODO: Fix URI
          },
          fillColor: this.state.fillColor,
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
                id: `https://purl.archive.org/domain/mlao/stage/${stageValue
                  .toLowerCase()
                  .replaceAll(" ", "-")}`,
                type: "lisa:PublishingStage",
                label: stageValue,
              }
            : "",
        }).toJson();
      }

      // Decide if we update or create
      if (!isForked && annotation) {
        // old path: update existing annotation
        storageAdapter.update(newAnno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      } else {
        // brand new annotation
        storageAdapter.create(newAnno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      }
    });

    this.setState({
      isForked: false,
      forkOriginalId: null,
      annoBody: "",
      svg: null,
      xywh: null,
      interpretationTypeValue: "",
      expressionUri: "",
      stageValue: "",
      textEditorStateBustingKey: textEditorStateBustingKey + 1,
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
    const { creatorOptions } = this.state;
    if (newValue && !creatorOptions.includes(newValue)) {
      this.setState({
        creatorOptions: [...creatorOptions, newValue],
        creatorValue: newValue,
      });
    } else {
      this.setState({ creatorValue: newValue });
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

  handleRecognitionLevelChange = (event, newValue) => {
    // 1) Derive the fill color based on the recognition level
    let nextFillColor;
    if (newValue === "Pre-Iconographical") {
      nextFillColor = "rgba(255, 0, 0, 0.2)"; // red-ish
    } else if (newValue === "Iconographical") {
      nextFillColor = "rgba(0, 255, 0, 0.2)"; // green-ish
    } else if (newValue === "Iconological") {
      nextFillColor = "rgba(0, 0, 255, 0.2)"; // blue-ish
    } else {
      nextFillColor = "rgba(255, 255, 255, 0.2)"; // fallback color
    }

    // 2) Update state so future shapes will use this new fill color
    this.setState({
      recognitionValue: newValue,
      fillColor: nextFillColor,
    });

    // 3) Update the current shape in Paper.js
    // If the user is *still* drawing a shape or has one selected, we can update its fill color
    if (this.annotationDrawingRef?.current?.currentPath) {
      this.annotationDrawingRef.current.currentPath.fillColor = nextFillColor;
    }

    // 4) Re-export paths so the final SVG (stored in `this.state.svg`) is updated
    if (this.annotationDrawingRef?.current?.reExportPaths) {
      this.annotationDrawingRef.current.reExportPaths();
    }
  };

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
    console.log("Expression URI:", event.target.value);
  }

  handleStageChange(event, newValue) {
    const { stageOptions } = this.state;
    if (newValue && !stageOptions.includes(newValue)) {
      this.setState({
        stageOptions: [...stageOptions, newValue],
        stageValue: newValue,
      });
    } else {
      this.setState({ stageValue: newValue });
    }
  }

  // Make addInterpretation an arrow function
  addInterpretation = () => {
    const { annotation } = this.props;
    if (!annotation) return;

    const { svg, xywh, fillColor } = this.state;

    this.setState({
      isForked: true,
      forkOriginalId: annotation.id,
      //recognitionValue: "",
      // keep geometry, reset textual fields
      annoBody: "",
      creatorValue: "",
      stageValue: "",
      expressionUri: "",
      interpretationTypeValue: "",
    });
  };

  render() {
    const { annotation, classes, closeCompanionWindow, id, windowId } =
      this.props;

    const {
      creatorOptions,
      //creatorValue,
      criterionOptions,
      //criterionValue,
      interpretationTypeOptions,
      //interpretationTypeValue,
      //expressionUri,
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
                    <CursorIcon />
                  </ToggleButton>
                  {/* <ToggleButton value="edit" aria-label="select cursor">
                    <FormatShapesIcon />
                  </ToggleButton> */}
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
                  aria-label="select color"
                  onClick={this.openChooseColor}
                >
                  <StrokeColorIcon style={{ fill: strokeColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="strokeColor"
                  aria-label="select line weight"
                  onClick={this.openChooseLineWeight}
                >
                  <LineWeightIcon />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="fillColor"
                  aria-label="select color"
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
                /* close / open polygon mode only for freehand drawing mode. */
                activeTool === "freehand" ? (
                  <ToggleButtonGroup
                    size="small"
                    value={closedMode}
                    onChange={this.changeClosedMode}
                  >
                    <ToggleButton value="closed">
                      <ClosedPolygonIcon />
                    </ToggleButton>
                    <ToggleButton value="open">
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
                  labelId="recognition-level-label"
                  id="recognition-level-select"
                  value={this.state.recognitionValue}
                  onChange={(event) => {
                    this.handleRecognitionLevelChange(
                      event,
                      event.target.value
                    );
                  }}
                >
                  <MenuItem value="Pre-Iconographical">
                    Pre-Iconographical
                  </MenuItem>
                  <MenuItem value="Iconographical">Iconographical</MenuItem>
                  <MenuItem value="Iconological">Iconological</MenuItem>
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
                value={this.state.criterionValue}
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
                value={this.state.expressionUri}
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
                value={this.state.creatorValue}
                onChange={this.handleCreatorChange}
                options={creatorOptions}
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
                value={this.state.interpretationTypeValue}
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
              <Autocomplete
                freeSolo
                size="small"
                value={stageValue}
                onChange={this.handleStageChange}
                options={stageOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Stage"
                    fullWidth
                  />
                )}
              />
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
          {/* Add interpretation Button - show it just in edit mode */}
          {annotation && (
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={this.addInterpretation}
                >
                  Add Interpretation
                </Button>
              </Grid>
            </Grid>
          )}

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
        <Popover
          open={lineWeightPopoverOpen}
          anchorEl={popoverLineWeightAnchorEl}
        >
          <Paper>
            <ClickAwayListener onClickAway={this.handleCloseLineWeight}>
              <MenuList autoFocus role="listbox">
                {[1, 3, 5, 10, 50].map((option, index) => (
                  <MenuItem
                    key={option}
                    onClick={this.handleLineWeightSelect}
                    value={option}
                    selected={option === strokeWidth}
                    role="option"
                    aria-selected={option === strokeWidth}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>
        <Popover
          open={colorPopoverOpen}
          anchorEl={popoverAnchorEl}
          onClose={this.closeChooseColor}
        >
          <SketchPicker
            // eslint-disable-next-line react/destructuring-assignment
            color={this.state[currentColorType] || {}}
            onChangeComplete={this.updateStrokeColor}
          />
        </Popover>
      </CompanionWindow>
    );
  }
}

/** */
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

AnnotationCreation.defaultProps = {
  annotation: null,
  canvases: [],
  closeCompanionWindow: () => {},
};

export default withStyles(styles)(AnnotationCreation);
