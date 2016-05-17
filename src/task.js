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
    var self = {
        // properties
        scope: createScope(userCanvasId),
        goalScope: createScope(goalCanvasId),
        rater: new procrustes(),
        log: [],
        actions: null,
        // actions
        createActions: (log, scope, goalScope, rater) => 
            Actions(log, [Lines(scope, goalScope, rater.procrustes)]),
        replay: (cb) => ReplayTrial(self.scope, self.actions, self.log, cb).start(),
        // scope and trial functions
        activateUserScope,
        createScope,
        initializeTrials,
        run
    }
    self.actions = self.createActions(self.log, self.scope, self.goalScope, self.rater);
    self.trials = self.initializeTrials(self.scope, self.actions, cueText);
    self.test = co.wrap(self.trials[0]);
    self.activateUserScope();
    return self

    function run(cb){
        return co(function* () {
            for (let gen of self.trials) yield* gen();
            yield cb;
        });
    }

    function initializeTrials(scope, actions, cueText){
        var drawing = DrawingTrial(scope, actions);
        var intro = IntroTrial(scope, actions, cueText);
        var scoring = ScoringTrial(scope, actions);
        return trialPars.map(el => sequence([intro, drawing(el), scoring]));
    }

    function activateUserScope(){
        var scope = self.scope
        scope.view.onFrame = function(){
            scope.view.draw();
        };
        scope.currentStyle = { strokeColor: 'black'};
        return scope;
    }

    function createScope(canvasId){
        var scope = new paper.PaperScope(); // will be manually drawn
        scope.setup(canvasId);
        scope.currentStyle = { strokeColor: 'black'};
        console.log(scope)
        return scope;
    }
}

function sequence(arr){
    return function *(){
        for (let el of arr) yield new Promise(resolve => el(resolve).start())
    };
}

