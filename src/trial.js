// Doers ----------------------------------

var Lines = exports.Lines = function(paper){
    return {
        paths: [],
        crnt_path: null,
        numDrawn: 0,
        numStrokes: 0,
        drawLine: function({start, end}) {
            this.numDrawn += 1;
            return new paper.Path([start, end])
        },
        addPoint: function({x, y}) { 
            return this.crnt_path.add([x,y]) 
        },
        newPath: function({x, y}) {
            this.crnt_path = new paper.Path([x,y]);
            this.paths.push(this.crnt_path);
            this.numStrokes += 1;
            return this.crnt_path;
        },
        clear: function() {
            paper.project.clear();
            new paper.Layer().activate();
        }
    }
}

var Actions = exports.Actions = function(log, doers){
    var obj = {
        log: log,
        dispatch: function(row) {
            row.time = performance.now();
            this.log.push(row);
            return this[row.type](row);
        },
        dispatchOrder: function(pars){
            // dispatch for all rows from start of array with the same order
            // slices off rows in-place
            var order = pars[0] ? pars[0].order : null;
            for (var ii=0; ii < pars.length;  ii++){
                var match = pars[ii] && pars[ii].order == order;
                if (!match) break
            }
            var sameOrd = pars.splice(0, ii);
            sameOrd.map(this.dispatch, this);
        }
    }
    return Object.assign(obj, ...doers)
}

var DrawingTrial = exports.DrawingTrial = function(paper, log, pars) {
    var self = {};
    self.log = log;
    self.actions = Actions(log, [Lines(paper)]);
    self.pars = pars.slice(0,pars.length); // shallow copy of pars

    paper.project.currentStyle = {strokeColor: "black"}

    self.notool = new paper.Tool();
    var tool = self.tool = new paper.Tool();
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
        self.actions.dispatchOrder(self.pars);
    }

    self.start = function(){
        self.actions.dispatchOrder(self.pars);
        self.tool.activate();
    }

    self.end = function(){
        return null
    }

    return self
}
