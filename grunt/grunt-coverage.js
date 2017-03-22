module.exports = function (grunt) {
     // config
     grunt.initConfig({
          env: {
               coverage: {
                    APP_DIR_FOR_CODE_COVERAGE: 'tests/coverage/instrument/app/'
               }
          },
          clean: {
               coverage: {
                    src: ['tests/coverage/']
               }
          },
          copy: {
               views: {
                    expand: true,
                    flatten: false,
                    src: ['app/**/*'],
                    dest: 'tests/coverage/instrument/app/'
               }
          },
          instrument: {
               files: 'app/**/*.js',
               options: {
                    lazy: true,
                    basePath: 'tests/coverage/instrument/'
               }
          },
          storeCoverage: {
               options: {
                    dir: 'tests/coverage/reports'
               }
          },
          makeReport: {
               src: 'tests/coverage/reports/**/*.json',
               options: {
                    type: 'lcov',
                    dir: 'tests/coverage/reports',
                    print: 'detail'
               }
          },
          reloadTasks: {
               rootPath: 'tests/coverage/instrument'
          }
     });

     // plugins
     grunt.loadNpmTasks("grunt-mocha");
     grunt.loadNpmTasks("grunt-mocha-test");
     grunt.loadNpmTasks('grunt-contrib-watch');
     grunt.loadNpmTasks('grunt-contrib-clean');
     grunt.loadNpmTasks('grunt-contrib-copy');
     grunt.loadNpmTasks('grunt-istanbul');
     grunt.loadNpmTasks('grunt-env');

};
