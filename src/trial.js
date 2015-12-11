var {curry} = require('ramda');
var {Actions} = require('./utils.js');
var Thread = require('./thread.coffee');

module.exports = {
    pathToLandmarks: pathToLandmarks,
    Lines: Lines,
    IntroTrial: curry(IntroTrial),
    DrawingTrial: curry(DrawingTrial),
    ScoringTrial: curry(ScoringTrial),
    ReplayTrial: curry(ReplayTrial),
    DrawingTrialDemo: curry(DrawingTrialDemo)
}

function pathToLandmarks(p, nPoints){
    var stride = p.length / nPoints;
    var markers = Array(nPoints).fill(0).map((v, ii) => ii*stride);
    markers[markers.length - 1] = p.length;  // in case last goes slightly over
    
    var points = markers.map(val => p.getPointAt(val));
    return [points.map(pnt => pnt.x), points.map(pnt => pnt.y)]
};

function joinLandmarks(arr){
    return [[].concat(...arr.map(el => el[0])),
            [].concat(...arr.map(el => el[1]))]
};

// Doers ----------------------------------
function Lines(paper, goal, scoring = null){
    if (!scoring) scoring = function(){return 10}
    return {
        userPaths: [],
        compPaths: [],
        crnt_path: null,
        draw: function({points}){
            var p = new goal.Path(points);
            this.compPaths.push(p);
            goal.project.activeLayer.addChild(p);
            goal.view.draw();
            return p
        },
        drawLine: function({start, end}) {
            var p = new goal.Path([start, end]);
            this.compPaths.push(p);
            goal.project.activeLayer.addChild(p);
            goal.view.draw();
            return p
        },
        addPoint: function({x, y}) { 
            return this.crnt_path.add([x,y]) 
        },
        newPath: function({x, y}) {
            this.crnt_path = new paper.Path([x,y]);
            this.userPaths.push(this.crnt_path);
            return this.crnt_path;
        },
        clear: function({scopeName}) {
            if (scopeName == null || scopeName === 'computer'){
                goal.project.clear();
                new goal.Layer().activate();
                goal.view.draw();
            }
            if (scopeName == null || scopeName === 'user'){
                paper.project.clear();
                paper.view.draw();
                return new paper.Layer().activate();
            }
        },
        reset: function(){
            this.userPaths = [];
            this.compPaths = [];
            this.crnt_path = null;
        },
        getData: function({nPoints}){
            return {
             user: this.userPaths.map(p => pathToLandmarks(p, nPoints)),
             comp: this.compPaths.map(p => pathToLandmarks(p, nPoints))
            }
        },
        scoreDrawn: function({user, comp, nIters}){
            return scoring(joinLandmarks(user), joinLandmarks(comp), nIters)
        },
        prompt: function({x, y, content}){
            new paper.PointText({
                point: [x, y],
                content: content,
                justification: 'center'
            })
        }
    }
}

function IntroTrial(paper, actions, promptText, resolve){
    var self = {};

    self.actions = actions;//[Lines(paper)]);

    self.tool = new paper.Tool();  // prompt before trial starts
    self.tool.onKeyUp = function(event){
        if (event.key == "space") {
            self.end();
        }
    };

    self.start = function(){
        self.actions.dispatch({type: 'clear'});
        var c = paper.view.center;
        self.actions.dispatch({type: 'prompt', x: c.x, y: c.y, content: promptText});
        self.tool.activate();
    };

    self.end = function(){
        self.tool.remove();
        resolve();
    }

    return self
}

function DrawingTrial(paper, actions, pars, resolve) {
    var self = {};
    self.actions = actions;
    self.pars = pars.slice(0,pars.length); // shallow copy of pars
    self.options = {};

    self.notool = new paper.Tool();      // default

    var tool = self.tool = new paper.Tool(); // main tool used for drawing
    tool.onMouseDown = function(event){
        var row = {
            type: 'newPath',
            x: event.point.x,
            y: event.point.y,
        }
        self.actions.dispatch(row);
    };

    tool.onMouseDrag = function(event){
        var row = {
            type: 'addPoint',
            x: event.point.x,
            y: event.point.y,
        }
        self.actions.dispatch(row);
    };

    tool.onMouseUp = function(event) {
        if (self.pars.length === 0) {
            self.end();
        }
        self.actions.dispatchOrder(self.pars);
    };


    self.start = function(){
        console.log('starting trial');
        self.actions.dispatch({type: 'clear'});
        paper.project.currentStyle = {strokeColor: "black"};
        self.actions.dispatchOrder(self.pars); // first trial
        self.tool.activate();
        
    };

    self.end = function(){
        self.tool.remove();
        self.notool.remove();
        resolve();
    }

    return self
}

function ScoringTrial(paper, actions, resolve){
    var nPoints = 50, nIters = 50;
    var self = {};
    self.actions = actions;
    //self.pars = pars.slice(0,pars.length); // shallow copy of pars

    self.tool = new paper.Tool();  // prompt before trial starts
    self.tool.onKeyUp = function(event){
        if (event.key == "space") {
            self.end();
        }
    };

    self.start = function(){
        var c = paper.view.center;
        var data = actions.dispatch({type: 'getData', nPoints: nPoints});
        var score = actions.dispatch({
            type: 'scoreDrawn', 
            user: data.user, 
            comp: data.comp,
            nIters: nIters
        });
        console.log(score);
        // wide to long
        var [x, y] = score.final;
        var trans = x.map((el, ii) => [x[ii], y[ii]])
        var Nsegs = data.user.length;
        var segments = Array(Nsegs).fill(0)
            .map((v, ii) => trans.slice(ii*nPoints, (ii+1)*nPoints))

        for (let seg of segments) 
            actions.dispatch({type: 'draw', points: seg});
        actions.dispatch({type: 'clear', scopeName: 'user'});
        var c = paper.view.center
        actions.dispatch({type: 'prompt', x: c.x, y: c.y, content: "[feedback]"});
    };

    self.end = function(){
        self.actions.dispatch({type: 'clear'});
        self.actions.dispatch({type: 'reset'});
        resolve();
    };

    return self;
}

function ReplayTrial(paper, actions, pars, resolve){
    var prevOnFrame = paper.view.onFrame;

    self = {}
    self.pars = pars.slice(0,pars.length); // shallow copy of pars

    self.thread = new Thread(self.pars, {
        playEntry: entry => actions.dispatch(entry),
        callback: () => {
            paper.view.off('frame').on('frame', prevOnFrame);
            resolve();
        }
    });

    self.start = function(){
        self.thread.startTime = performance.now() - self.pars[0].time;  // first starts immediately
        paper.view.on('frame', () => self.thread.run(performance.now()))
    };

    return self
    
};

function DrawingTrialDemo(){return null}
