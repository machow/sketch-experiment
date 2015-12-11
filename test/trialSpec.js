var Trial = require('../src/trial.js');
var paper = require("paper/dist/paper-full.js");

describe("Trial", function(){
    var c, scope, lines

    beforeEach(function(){
        c = document.createElement('canvas');
        scope = paper.setup(c);
        lines = Trial.Lines(scope, scope)
    });

    it("draws a line", function(){
        var path = lines.drawLine({start: [50,50], end: [100,100]});
        expect(path.segments.length).toEqual(2);
        expect(path.firstSegment.point.x).toEqual(50);
    });

    it("creates a new path", function() {
        var path = lines.newPath({x: [25, 25], y: [25,25]});
        expect(lines.crnt_path).toBe(path)
    });

    it("adds a new point", function() {
        var p = lines.newPath({start: [25, 25], end: [25,25]});
        var seg = lines.addPoint({x: 50, y: 50});
        expect(seg.point).toBe(lines.crnt_path.lastSegment.point)
    });

    it("counts strokes correctly", function(){
        var p = lines.newPath({x: 25, y: 25});
        expect(lines.userPaths.length).toEqual(1);
        var p2 = lines.newPath({x: 50, y: 50});
        expect(lines.userPaths.length).toEqual(2);
    });

    it("counts drawn lines correctly", function(){
        lines.drawLine({start: [25,25], end: [25,25]});
        expect(lines.compPaths.length).toEqual(1);
        lines.drawLine({start: [50,50], end: [50,50]});
        expect(lines.compPaths.length).toEqual(2);
    });
});

var utils = require("../src/utils.js");

describe("Trial intro", function(){
    var c1, c2, scope1, scope2, log, actions

    beforeEach(function(){
        c1 = document.createElement('canvas');
        c2 = document.createElement('canvas');
        scope1 = paper.setup(c1);
        scope2 = paper.setup(c2);
        log = [];
        actions = utils.Actions(log, [Trial.Lines(scope1, scope2)]);
    });

    it("runs the intro trial", function(){
        var intro = Trial.IntroTrial(scope1, actions, "test prompt", function(){return null});
        intro.start();
        intro.tool.emit("keyup", {key: "space"});
        
        expect(log.length).toEqual(2) // prompt + clearing actions
    });

    it("runs the drawing trial", function(){
        var data = [
            {type: 'drawLine', start: [50, 50], end: [250, 50], order: 0},
            {type: 'drawLine', start: [250, 50], end: [250, 250], order: 0},
            {type: 'drawLine', start: [250, 250], end: [50, 250], order: 1}
        ];
        
        var draw = Trial.DrawingTrial(scope1, actions, data, function(){null});
        draw.start();
        // first set of lines
        draw.tool.emit('mousedown', {point: {x: 10, y: 10}});
        draw.tool.emit('mousedrag', {point: {x: 15, y: 15}});
        draw.tool.emit('mouseup', {point: {x: 20, y: 20}});

        expect(log.filter(el => el.type == 'addPoint').length).toBe(1);

        // second set of lines
        draw.tool.emit('mousedown', {point: {x: 10, y: 10}});
        draw.tool.emit('mousedrag', {point: {x: 15, y: 15}});
        draw.tool.emit('mouseup', {point: {x: 20, y: 20}});

        expect(log.filter(el => el.type == 'addPoint').length).toBe(2);
    });
});

describe("utils", function(){
    it("creates action dispatcher", function(){
        var actions = utils.Actions([], [{
            a: function(){return 'a'},
            b: 'no'
        }]);
        var res = actions.dispatch({type: 'a'})
        expect(res).toEqual('a');
    });
});
