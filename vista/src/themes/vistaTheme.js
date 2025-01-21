export const vistaTheme = {
  selectedTheme: "VISTA Theme",
  themes: {
    light: {
      palette: {
        type: "light",
      },
    },
    "VISTA Theme": {
      palette: {
        type: "dark",
        primary: {
          main: "#ffffff", // Your custom primary color
        },
        secondary: {
          main: "#f3f3f3b3", // Your custom secondary color
        },
        shades: {
          dark: "#2d3439", // Dark shade for dark theme
          main: "#2d3439", // Main shade for dark theme
          light: "#2d3439", // Light shade for dark theme
        },
        error: {
          main: "#b00020", // Error color
        },
        notification: {
          main: "#ffa224", // Notification color
        },
        hitCounter: {
          default: "#bdbdbd", // Hit counter color
        },
        highlights: {
          primary: "#ffff00", // Primary highlight color
          secondary: "#00BFFF", // Secondary highlight color
        },
        section_divider: "rgba(0, 0, 0, 0.25)", // Divider color
        annotations: {
          hidden: {
            globalAlpha: 0,
          },
          default: {
            strokeStyle: "#00BFFF",
            globalAlpha: 1,
          },
          hovered: {
            strokeStyle: "#BF00FF",
            globalAlpha: 1,
          },
          selected: {
            strokeStyle: "#afa26a",
            globalAlpha: 1,
          },
        },
        search: {
          default: {
            fillStyle: "#00BFFF",
            globalAlpha: 0.3,
          },
          hovered: {
            fillStyle: "#00FFFF",
            globalAlpha: 0.3,
          },
          selected: {
            fillStyle: "#ffff00",
            globalAlpha: 0.3,
          },
        },
      },
      typography: {
        //fontFamily: "Open Sans, sans-serif", // Set the default font-family
        body1: {
          fontSize: "1rem",
          letterSpacing: "0em",
          lineHeight: "1.6em",
        },
        body2: {
          fontSize: "0.878rem",
          letterSpacing: "0.015em",
          lineHeight: "1.6em",
        },
        button: {
          fontSize: "0.878rem",
          letterSpacing: "0.09em",
          lineHeight: "2.25rem",
          textTransform: "uppercase",
        },
        caption: {
          fontSize: "0.772rem",
          letterSpacing: "0.033em",
          lineHeight: "1.6rem",
        },
        body1Next: {
          fontSize: "1rem",
          letterSpacing: "0em",
          lineHeight: "1.6em",
        },
        body2Next: {
          fontSize: "0.878rem",
          letterSpacing: "0.015em",
          lineHeight: "1.6em",
        },
        buttonNext: {
          fontSize: "0.878rem",
          letterSpacing: "0.09em",
          lineHeight: "2.25rem",
        },
        captionNext: {
          fontSize: "0.772rem",
          letterSpacing: "0.33em",
          lineHeight: "1.6rem",
        },
        overline: {
          fontSize: "0.678rem",
          fontWeight: 500,
          letterSpacing: "0.166em",
          lineHeight: "2em",
          textTransform: "uppercase",
        },
        h1: {
          fontSize: "2.822rem",
          letterSpacing: "-0.015em",
          lineHeight: "1.2em",
        },
        h2: {
          fontSize: "1.575rem",
          letterSpacing: "0em",
          lineHeight: "1.33em",
        },
        h3: {
          fontSize: "1.383rem",
          fontWeight: 300,
          letterSpacing: "0em",
          lineHeight: "1.33em",
        },
        h4: {
          fontSize: "1.215rem",
          letterSpacing: "0.007em",
          lineHeight: "1.45em",
        },
        h5: {
          fontSize: "1.138rem",
          letterSpacing: "0.005em",
          lineHeight: "1.55em",
        },
        h6: {
          fontSize: "1.067rem",
          fontWeight: 400,
          letterSpacing: "0.01em",
          lineHeight: "1.6em",
        },
        subtitle1: {
          fontSize: "0.937rem",
          letterSpacing: "0.015em",
          lineHeight: "1.6em",
          fontWeight: 300,
        },
        subtitle2: {
          fontSize: "0.878rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
          lineHeight: "1.75em",
        },
        useNextVariants: true, // set so that console deprecation warning is removed
      },
      overrides: {
        MuiAppBar: {
          root: {
            "&.MuiAppBar-positionAbsolute": {
              display: "none", // Hide the left toolbar
            },
          },
        },
        MuiPaper: {
          root: {
            backgroundColor: "#2d3439", // Your custom background color for the left sidebar
          },
        },
        MuiFab: {
          primary: {
            backgroundColor: "#822433", // Default button background color
            color: "#fff", // Default button text color
            "&:hover": {
              backgroundColor: "#ac3b3b", // Button hover background color
            },
          },
        },
        MuiListSubheader: {
          root: {
            '&[role="presentation"]:focus': {
              outline: 0,
            },
          },
        },
        MuiTooltip: {
          // Overridden from https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/Tooltip/Tooltip.js#L40-L70
          tooltipPlacementLeft: {
            "@media (min-width:600px)": {
              margin: 0,
            },
          },
        },
        MuiTouchRipple: {
          childPulsate: {
            animation: "none",
          },
          rippleVisible: {
            animation: "none",
          },
        },
      },
      props: {
        MuiButtonBase: {
          disableTouchRipple: true,
        },
        MuiLink: {
          underline: "always",
        },
      },
    },
  },
};
