module.exports = function (config) {
    config.set({
        frameworks: ['browserify', 'jasmine'],
        files: [
            'src/**/*.js',
            'test/**/*_spec.js'
        ],
        preprocessors: {
            'test/**/*.js': ['jshint', 'browserify'],
            'src/**/*.js': ['jshint', 'browserify']
        },
        browsers: ['PhantomJS'],
        plugins : ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-jshint-preprocessor', 'karma-browserify'],
        browserify: {
            debug: true
        }
    });
};
