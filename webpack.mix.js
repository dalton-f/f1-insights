const mix = require("laravel-mix");

mix
  .js("src/js/app.js", "static/js/app.js")
  .postCss("src/css/app.pcss", "static/css/app.css", [require("tailwindcss")]);
