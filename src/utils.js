parToPaper = function(parRow){
    return {
        segments: [parRow.x, parRow.y],
        strokeColor: 'black'
    }
};

paperToPar = function(opts){
    return {x: opts.segments[0], y: opts.segments[1]}
}

shepherd
