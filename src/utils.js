var shepherd = window.shepherd = require('tether-shepherd')
var $ = require('jquery')

module.exports = {
    instructions: instructions,
    Actions: Actions
};

function instructions(prefix, url, tour) {
    return $.get(url, function(data) {
        window.d = data;
        var arr = $(data).filter('.instruct').toArray();
        arr.forEach((el, ii) => tour.addStep(prefix+ii, {text: el}) );
    })
}

function Actions(log, doers){
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
        },
        attach: function(doer){
            Object.keys(doer)
                .filter( k => typeof(doer[k]) == "function")
                .forEach( k => this[k] = doer[k].bind(doer))
        }
    };

    doers.forEach((doer) => obj.attach(doer));

    return obj // please
}
