var {Lines, IntroTrial, DrawingTrial, ScoringTrial, ReplayTrial} = require('./trial.js');
var Shepherd = require('tether-shepherd');
var {Actions} = require('./utils.js');
var procrustes = require('procrustesjs');
var paper = require('paper/dist/paper-full.js')
var co = require('co');

module.exports = {
    Task: Task,
    sequence: sequence
};
                    

function Task(userCanvasId, goalCanvasId, cueText, trialPars){
    // Set up both canvases
    var scope = new paper.PaperScope();
    scope.setup(userCanvasId);
    scope.view.onFrame = function(){
        scope.view.draw();
    };
    scope.currentStyle = { strokeColor: 'black'};

    var goalScope = new paper.PaperScope(); // will be manually drawn
    goalScope.setup(goalCanvasId);
    goalScope.currentStyle = { strokeColor: 'black'};

    scope.activate();
    
    console.log(scope);
    console.log(goalScope);

    // Set up scoring using procrustes transformation
    var rater = new procrustes()

    // Set up trials themselves
    var self = {scope, goalScope}
    self.log = []
    self.actions = Actions(self.log, [Lines(scope, goalScope, rater.procrustes)]);
    var drawing = DrawingTrial(scope, self.actions);
    var intro = IntroTrial(scope, self.actions, cueText);
    var scoring = ScoringTrial(scope, self.actions);
    console.log(drawing);

    // each round is a generator that yields promises for each stage
    self.trials = trialPars.map(el => sequence([intro, drawing(el), scoring]));

    self.run = (cb) => co(function* () {
        for (let gen of self.trials) yield* gen();
        yield cb;
    });

    self.test = co.wrap(self.trials[0]);
    self.replay = (cb) => ReplayTrial(scope, self.actions, self.log, cb).start();

    return self
}

function sequence(arr){
    return function *(){
        for (let el of arr) yield new Promise(resolve => el(resolve).start())
    };
}

