/** @type {import('tailwindcss').Config} */
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
        "vista-violet": {
          light: "var(--vista-violet-light)",
          DEFAULT: "var(--vista-violet)",
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
          dark: "var(--vista-yellow-dark)",
        },
        "vista-magenta": {
          DEFAULT: "var(--vista-magenta)",
          dark: "var(--vista-magenta-dark)",
        },
        "vista-purple": {
          DEFAULT: "var(--vista-purple)",
          dark: "var(--vista-purple-dark)",
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
          60: "var(--vista-anno-preico-60)",
          DEFAULT: "var(--vista-anno-preico)",
        },
        "vista-anno-iconogra": {
          DEFAULT: "var(--vista-anno-iconogra)",
        },
        "vista-anno-iconolo": {
          DEFAULT: "var(--vista-anno-iconolo)",
        },
        "vista-anno-preico-chip": {
          DEFAULT: "var(--vista-anno-preico-chip)",
        },
        "vista-anno-iconogra-chip": {
          DEFAULT: "var(--vista-anno-iconogra-chip)",
        },
        "vista-anno-iconolo-chip": {
          DEFAULT: "var(--vista-anno-iconolo-chip)",
        },
      },
    },
  },
  plugins: [],
};
