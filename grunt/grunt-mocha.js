module.exports = function (grunt) {
     grunt.loadNpmTasks('grunt-mocha-test');
     grunt.loadNpmTasks("grunt-mocha");
     grunt.registerTask("test", ["mochaTest"]);
     grunt.config.merge({
          mochaTest: {
               all: {
                    options: {
                         reporter: 'spec'
                    },
                    src: ['tests/**/*.js']
               }
          }
          //
          // mochaTest: {
          //      files: ["tests/**/*.spec.js"]
          // },
          // mocha: {
          //      options: {
          //           reporter: 'spec',
          //           captureFile: 'results.txt', // Optionally capture the reporter output to a file
          //           quiet: false, // Optionally suppress output to standard out (defaults to false)
          //           clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          //           noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
          //      },
          //      src: ['tests/**/*.spec.js']
          // },
          // mochaTestConfig: {
          //      options: {
          //           reporter: 'Spec'
          //      }
          // }
     });
};
