'use strict';

let path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/js/app/app.js',
  output: {
    filename: 'bundle.js',
    path: 'C:/Users/khore/Desktop/Kurs/JS-practic/quiz-modules/js/'
  },
  watch: true,

  devtool: "source-map",

  module: {}
};