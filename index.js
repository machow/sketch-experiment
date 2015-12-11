require('babel-polyfill');
var Thread = window.Thread = require('./src/thread.coffee');
window.procrustes = require('procrustesjs')
var {DrawingTrial} = require('./src/trial.js');
window.Task = require('./src/task.js')['Task'];
window.DrawingTrial = DrawingTrial;
var paper = window.paper = require("paper/dist/paper-full.js");
var shepherd = window.shepherd = require('tether-shepherd');
window.instructions = require('./src/utils.js')['instructions'];
var $ = window.$ = require('jquery')

window.utils = require('./src/utils.js');

module.exports = DrawingTrial
