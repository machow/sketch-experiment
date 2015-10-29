var {DrawingTrial} = require('./src/trial.js')
window.DrawingTrial = DrawingTrial
var paper = window.paper = require("paper/dist/paper-full.js")
require('./src/instructs.js')

module.exports = DrawingTrial
