import React from "react";
import PropTypes from "prop-types";

const AnnotationCard = ({
  id,
  creator,
  body,
  recognition,
  citation,
  onDisagree,
  onEdit,
  onConnect,
}) => {
  // Map recognition level to Tailwind background colors.
  const backgroundColorMapping = {
    "Pre-Iconographical": "bg-vista-anno-preico-60",
    Iconographical: "var(--vista-anno-iconogra)",
    Iconological: "var(--vista-anno-iconolo)",
    default: "var(--vista-gray)",
  };

  const recognitionBgColor =
    backgroundColorMapping[recognition] || backgroundColorMapping.default;

  const borderColorMapping = {
    "Pre-Iconographical": "border-vista-anno-preico",
    Iconographical: "var(--vista-anno-iconogra)",
    Iconological: "var(--vista-anno-iconolo)",
    default: "var(--vista-gray)",
  };

  const recognitionBdColor =
    borderColorMapping[recognition] || borderColorMapping.default;

  return (
    <div
      className={`p-4 rounded-lg ${recognitionBgColor} flex flex-col justify-between border ${recognitionBdColor} mb-2`}
    >
      {/* Header: Creator and ID */}
      <div className="flex justify-between items-center">
        <div className="text-left text-sm">{creator}</div>
        <div className="text-xs text-gray-600 break-all">{id}</div>
      </div>
      {/* Body content */}
      <div className="mt-2 text-sm">{body}</div>
      {/* Optional citation */}
      {citation && (
        <div className="mt-2 text-xs text-blue-600">Citation: {citation}</div>
      )}
      {/* Action buttons */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onDisagree(id)}
          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
        >
          Disagree?
        </button>
        <button
          onClick={() => onEdit(id)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => onConnect(id)}
          className="px-3 py-1 bg-green-500 text-white rounded text-xs"
        >
          Connect
        </button>
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
