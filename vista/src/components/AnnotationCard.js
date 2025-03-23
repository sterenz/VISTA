import React from "react";
import PropTypes from "prop-types";
import AddLinkIcon from "@material-ui/icons/Link";
import EditIcon from "@material-ui/icons/Edit";

const AnnotationCard = ({
  id,
  creator,
  body,
  recognition,
  citation,
  stage,
  onDisagree,
  onEdit,
  onConnect,
}) => {
  // Map recognition level to Tailwind background colors.
  const backgroundColorMapping = {
    "Pre-Iconographical": "bg-vista-anno-preico-60",
    Iconographical: "bg-vista-anno-iconogra-60",
    Iconological: "bg-vista-anno-iconolo-60",
    default: "bg--vista-gray",
  };

  const recognitionBgColor =
    backgroundColorMapping[recognition] || backgroundColorMapping.default;

  const borderColorMapping = {
    "Pre-Iconographical": "border-vista-anno-preico-60",
    Iconographical: "border-vista-anno-iconogra-60",
    Iconological: "border-vista-anno-iconolo-60",
    default: "border-vista-anno-gray",
  };

  const recognitionBdColor =
    borderColorMapping[recognition] || borderColorMapping.default;

  const stageColorMapping = {
    Draft: "var(--vista-orange)",
    Published: "var(--vista-green)",
    Deprecated: "var(--vista-gray-dark)",
    default: "var(--vista-gray)",
  };
  const stageColor = stageColorMapping[stage] || stageColorMapping.default;

  return (
    <div
      className={`p-4 pb-2 rounded-r-lg ${recognitionBgColor} flex flex-col justify-between border ${recognitionBdColor} mb-2 text-vista-text text-left`}
      style={{
        borderLeft: `4px solid ${stageColor}`,
      }}
    >
      {/* Header: Creator and ID */}
      <div className="flex justify-between items-center">
        <div className="text-left text-sm">{creator}</div>
        <div className="text-xs text-gray-600 break-all">{id}</div>
      </div>
      {/* Body content */}
      <div className="py-3 font-semibold">{body}</div>
      {/* Optional citation */}
      {citation && <div className="mt-2 text-sm">Citation: {citation}</div>}
      {/* Action buttons */}
      <div
        className={`mt-4 pt-1 flex justify-between space-x-2 border-t ${recognitionBdColor}`}
      >
        <button
          onClick={() => onDisagree(id)}
          className="text-sm font-bold hover:underline"
        >
          Disagree?
        </button>
        <div>
          <button
            onClick={() => onEdit(id)}
            className="p-2 rounded-lg hover:bg-vista-gray"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onConnect(id)}
            className="p-2 rounded-lg hover:bg-vista-gray"
          >
            <AddLinkIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

AnnotationCard.propTypes = {
  id: PropTypes.string.isRequired,
  creator: PropTypes.string,
  body: PropTypes.string,
  recognition: PropTypes.oneOf([
    "Pre-Iconographical",
    "Iconographical",
    "Iconological",
  ]).isRequired,
  citation: PropTypes.string,
  onDisagree: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
};

AnnotationCard.defaultProps = {
  creator: "Unknown",
  body: "",
  citation: "",
};

export default AnnotationCard;
