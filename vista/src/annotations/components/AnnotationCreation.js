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
import FormatShapesIcon from "@material-ui/icons/FormatShapes";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select, { SelectChangeEvent } from "@material-ui/core/Select";
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
import Accordion from "@material-ui/core/Accordion";
import AccordionActions from "@material-ui/core/AccordionActions";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

/** */
class AnnotationCreation extends Component {
  /** */
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
        }
        if (props.annotation.recognitionValue) {
          annoState.recognitionValue = props.annotation.recognitionValue;
        }
        if (props.annotation.fillColor) {
          annoState.fillColor = props.annotation.fillColor;
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
    //this.handleChange = this.handleChange.bind(this);
    //this.handleAnchorChange = this.handleAnchorChange.bind(this);
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
      annoBody,
      tags,
      xywh,
      svg,
      //conceptualLevel,
      recognitionValue,
      //anchorValue,
      entityValue,
      creatorValue,
      criterionValue,
      interpretationTypeValue,
      expressionUri,
      stageValue,
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
      stageValue: "",
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

  // handleChange(event) {
  //   console.log("EVENTO ----->", event);
  //   this.setState({ conceptualLevel: event.target.value });
  //   console.log(this.conceptualLevel);
  // }

  /** */
  // handleAnchorChange(event, newValue) {
  //   const { anchorOptions } = this.state;
  //   if (newValue && !anchorOptions.includes(newValue)) {
  //     this.setState({
  //       anchorOptions: [...anchorOptions, newValue],
  //       anchorValue: newValue,
  //     });
  //   } else {
  //     this.setState({ anchorValue: newValue });
  //   }
  // }

  // handleAnchorChange(event, newValue) {
  //   const { anchorOptions } = this.state;

  //   // 1) Choose a color based on the recognition level
  //   let nextFillColor = null;
  //   if (newValue === "Pre-Iconographical") {
  //     nextFillColor = "rgba(255, 0, 0, 0.3)"; // red-ish
  //   } else if (newValue === "Iconographical") {
  //     nextFillColor = "rgba(0, 255, 0, 0.3)"; // green-ish
  //   } else if (newValue === "Iconological") {
  //     nextFillColor = "rgba(0, 0, 255, 0.3)"; // blue-ish
  //   }

  //   // Example in AnnotationCreation.js, after picking color in handleAnchorChange
  //   if (this.annotationDrawingRef?.current?.currentPath) {
  //     this.annotationDrawingRef.current.currentPath.fillColor = nextFillColor;
  //   }
  //   // Re-export so your final SVG is updated with the new fill
  //   if (this.annotationDrawingRef?.current?.reExportPaths) {
  //     this.annotationDrawingRef.current.reExportPaths();
  //   }

  //   // 2) Keep old logic to allow free text or reuse existing anchor
  //   if (newValue && !anchorOptions.includes(newValue)) {
  //     this.setState({
  //       anchorOptions: [...anchorOptions, newValue],
  //       anchorValue: newValue,
  //       fillColor: nextFillColor, // set the fillColor
  //     });
  //   } else {
  //     this.setState({
  //       anchorValue: newValue,
  //       fillColor: nextFillColor, // set the fillColor
  //     });
  //   }
  // }

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
      nextFillColor = "rgba(255, 0, 0, 0.3)"; // red-ish
    } else if (newValue === "Iconographical") {
      nextFillColor = "rgba(0, 255, 0, 0.3)"; // green-ish
    } else if (newValue === "Iconological") {
      nextFillColor = "rgba(0, 0, 255, 0.3)"; // blue-ish
    } else {
      nextFillColor = "rgba(255, 255, 255, 0.3)"; // fallback color
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

  /** */
  render() {
    const { annotation, classes, closeCompanionWindow, id, windowId } =
      this.props;

    const {
      //anchorOptions,
      //anchorValue,
      //entityOptions,
      //entityValue,
      creatorOptions,
      creatorValue,
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
                    <CursorIcon />
                  </ToggleButton>
                  <ToggleButton value="edit" aria-label="select cursor">
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
              <FormControl fullWidth>
                {/* <InputLabel id="conceptual-level-label">
                Conceptual Level
              </InputLabel> */}
                {/* <Select
                  labelId="conceptual-level-label"
                  id="conceptual-level-select"
                  value={this.state.conceptualLevel}
                  onChange={this.handleChange}
                  autoWidth
                  label="Conceptual Level"
                > */}
                {/* <MenuItem value={"Work"}>Work</MenuItem>
                  <MenuItem value={"Expression"}>Expression</MenuItem>
                  <MenuItem value={"Manifestation"}>Manifestation</MenuItem>
                  <MenuItem value={"Item"}>Item</MenuItem> */}
                {/* <MenuItem value={"Pre-Iconographical"}>
                    Pre-Iconographical Recognition
                  </MenuItem>
                  <MenuItem value={"Iconographical"}>
                    Iconographical Recognition
                  </MenuItem>
                  <MenuItem value={"Iconological"}>
                    Iconological Recognition
                  </MenuItem>
                </Select> */}
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
                value={creatorValue}
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
            {/* <Grid item xs={12}>
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
            </Grid> */}
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
