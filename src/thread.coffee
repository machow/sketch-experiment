class Thread
    constructor: (@disc, {@callback, @context, playEntry} = {}) ->
        #if typeof disc == 'string'
        #    name = disc
        #    disc = @registered[name]
        #    console.log(disc)

        # parse metadata
        @name = ""
        @crnt_ii = 0
        @children = []
        @active = true

        @disc = [@disc] if not Array.isArray(@disc)
        if @disc[0]?.type is 'metadata' then @parseMetaData(@disc[0])

        # parse options

        @startTime = performance.now()

        @playEntry = playEntry if playEntry
        # function for calling class instance directly
        #return => @run

    parseMetaData: ({@name}) ->

    run: (crntTime) ->
        while (entry = @disc[@crnt_ii]) and 
              (entry.time is undefined or entry.time + @startTime <= crntTime)
            console.log(entry)
            @playEntry(entry, @)
            @crnt_ii++
        remaining = @disc.length - @crnt_ii
        if not remaining 
            # Wait for all children to become inactive before firing callback
            console.log('spent')
            if @activeChildren().length is 0
                @callback?()
                @active = false
        return remaining

    playEntry: () ->
        throw "must define playEntry"
        
    addChild: (child) ->
        @children.push(child)

    activeChildren: () ->
        block for block in @children when block.active

    end: () ->
        @crnt_ii = @disc.length

module.exports = Thread
