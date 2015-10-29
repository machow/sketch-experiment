module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      //'src/*.js',
      'test/**/*Spec.js'
    ],

    reporters: [ 'dots' ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    logLevel: 'LOG_DEBUG',

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [ 'babelify', 'browserify-shim'],
    }
  });
};
