var {DrawingTrial} = require('./src/trial.js');
window.DrawingTrial = DrawingTrial;
var paper = window.paper = require("paper/dist/paper-full.js");
var shepherd = window.shepherd = require('tether-shepherd');
window.instructions = require('./src/instructs.js')['instructions'];

module.exports = DrawingTrial
