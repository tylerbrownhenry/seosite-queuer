module.exports = function (grunt) {
     require('dotenv').config();
    //  grunt.registerTask('start', ['express']);
     //  require('./grunt/grunt-babel.js')(grunt);
     //  require('./grunt/grunt-benchmark.js')(grunt);
     require('./grunt/grunt-coverage.js')(grunt);
    //  require('./grunt/grunt-jsdoc.js')(grunt);
     require('./grunt/grunt-mocha.js')(grunt);
     require('./grunt/grunt-mocha-istanbul.js')(grunt);

    //  require('./grunt/grunt-jshint.js')(grunt);
    //  require('./grunt/grunt-watch.js')(grunt);
    //  require('./grunt/grunt-less.js')(grunt);
    //  require('./grunt/grunt-express.js')(grunt);

    //  grunt.registerTask('start', ['express:dev', 'less:development', 'express:dev', 'watch']);

    //  grunt.registerTask('default', 'watch', function () {
    //       var tasks = ['less:development', /* 'jshint', */ /*'mochaTest'*/ 'watch:express'];
    //       grunt.option('force', true);
    //       grunt.task.run(tasks);
    //  });
     //
    //  grunt.registerTask('watch-test', 'watch:test', function () {
    //       var tasks = ['mochaTest', 'watch:test'];
    //       grunt.option('force', true);
    //       grunt.task.run(tasks);
    //  });
     //
    //  grunt.registerTask('jsdoc',['jsdoc']);

     // tasks
    //  grunt.registerTask("test", ["mochaTest"]);
    //  grunt.registerTask('coverage', ['clean', 'copy:views', 'env:coverage',
          // 'instrument', 'reloadTasks', 'mochaTest', 'storeCoverage', 'makeReport'
    //  ]);
     grunt.registerTask('istanbul', ['mocha_istanbul']);


};
