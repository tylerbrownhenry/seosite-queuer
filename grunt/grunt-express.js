module.exports = function (grunt) {
     grunt.loadNpmTasks('grunt-express-server');
     grunt.config.merge({
          express: {
               dev: {
                    options: {
                         script: 'server.js',
                         port: 3001
                    }
               }
          },
     });
};;
