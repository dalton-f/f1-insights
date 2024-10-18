/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        "light-grey": "#f3f3f2",
      },
    },
  },
  plugins: [],
};
