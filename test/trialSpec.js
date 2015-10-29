var Trial = require('../src/trial.js');
var paper = require("paper/dist/paper-full.js");

describe("Trial", function(){
    var c, scope, lines

    beforeEach(function(){
        c = document.createElement('canvas');
        scope = paper.setup(c);
        lines = Trial.Lines(scope)
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
        expect(lines.numStrokes).toEqual(1);
        var p2 = lines.newPath({x: 50, y: 50});
        expect(lines.numStrokes).toEqual(2);
    });

    it("counts drawn lines correctly", function(){
        lines.drawLine({start: [25,25], end: [25,25]});
        expect(lines.numDrawn).toEqual(1);
        lines.drawLine({start: [50,50], end: [50,50]});
        expect(lines.numDrawn).toEqual(2);
    });
});
