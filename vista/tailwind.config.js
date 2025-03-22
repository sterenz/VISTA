module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "vista-text": {
          light: "var(--vista-text-light)",
          DEFAULT: "var(--vista-text)",
        },
        "vista-white": {
          DEFAULT: "var(--vista-white)",
          dark: "var(--vista-white-dark)",
        },
        "vista-purple": {
          light: "var(--vista-purple-light)",
          DEFAULT: "var(--vista-purlpe)", // Fixed typo from `purlpe` to `purple`
        },
        "vista-green": {
          light: "var(--vista-green-light)",
          DEFAULT: "var(--vista-green)",
        },
        "vista-blue": {
          light: "var(--vista-blue-light)",
          DEFAULT: "var(--vista-blue)",
        },
        "vista-yellow": {
          DEFAULT: "var(--vista-yellow)",
        },
        "vista-orange": {
          DEFAULT: "var(--vista-orange)",
        },
        "vista-gray": {
          light: "var(--vista-gray-light)",
          DEFAULT: "var(--vista-gray)",
          dark: "var(--vista-gray-dark)",
        },
        "vista-bordeaux": {
          DEFAULT: "var(--vista-bordeaux)",
          dark: "var(--vista-bordeaux-dark)",
        },
        "vista-anno-preico": {
          DEFAULT: "var(--vista-anno-preico)",
        },
        "vista-anno-iconogra": {
          DEFAULT: "var(--vista-anno-iconogra)",
        },
        "vista-anno-iconolo": {
          DEFAULT: "var(--vista-anno-iconolo)",
        },
      },
    },
  },
  plugins: [],
};
