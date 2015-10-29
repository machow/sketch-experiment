var shepherd = window.shepherd = require('tether-shepherd')
var $ = window.$ = require('jquery')

var instructions = window.instructs = function(prefix, url, tour) {
    return $.get(url, function(data) {
        window.d = data;
        var arr = $(data).filter('.instruct').toArray();
        arr.forEach((el, ii) => tour.addStep(prefix+ii, {text: el}) );
    })
}
