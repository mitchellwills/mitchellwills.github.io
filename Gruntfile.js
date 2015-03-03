module.exports = function(grunt) {

  var buildDir = 'build/';
  var distDir = buildDir+'dist/';
  
  var jsFiles = ['js/**/*.js'];
  var jsIncludedFiles = ['data/**/*'];
  var jsIncludeDir = buildDir+"js-include/";
  var jsIncludeFiles = [jsIncludeDir+'js/**/*.js'];
  var otherSrcFiles = ['lib/**/*', 'fancybox/**/*',
  'content/**/*', 'fonts/**/*', 'views/**/*', 'css/**/*', 'index.html', 'favicon.ico'];
  
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	'string-replace': {
      jsFileIncludes: {
        files: [
          { src: jsFiles, dest: jsIncludeDir },
        ],
        options: {
          replacements: [{
            pattern: /includeFile\(['"](.*?)['"]\)/ig,
            replacement: function (match, p1, offset, string) {
              console.log("Inserting file contents: '"+p1+"'");
              return grunt.file.read(p1);
            }
          }]
        }
      }
    },
    jshint: {
      gruntfile: {
        src: ['Gruntfile.js'],
      },
      js: {
        files: [
          { expand: true, cwd: jsIncludeDir, src: jsFiles },
        ],
      },
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    copy: {
      js: {
        files: [
          { expand: true, cwd: jsIncludeDir, src: jsFiles, dest: distDir },
        ],
      },
      other: {
        src: otherSrcFiles,
        dest: distDir,
      },
    },
    'ftp-deploy': {
      build: {
        auth: {
          host: 'mitchellwills.com',
          port: 21,
        },
        src: distDir,
        dest: '/test',
        exclusions: [],
      }
    },
    connect: {
      server: {
        options: {
          port: 8081,
          base: distDir,
          debug: true,
          open: true,
          livereload: true,
          middleware: function(connect, options){
            return [
              connect.static(options.base),
              function(req, res, next){//if couldn't find a file to serve then just serve index.html
                console.log("Rewriting URL: "+req.url+" -> /");
                req.url = "/";
                next();
              },
              connect.static(options.base),
            ];
          },
        }
      }
    },
	watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
      },
      dist: {
        files: distDir+'/**/*',
        options: {
          livereload: true,
        },
      },
      js: {
        files: jsFiles.concat(jsIncludedFiles),
        tasks: ['string-replace:jsFileIncludes', 'jshint:js', 'copy:js'],
      },
      other: {
        files: otherSrcFiles,
        tasks: ['copy:other'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');
  
  
  grunt.registerTask('default', ['dist']);
  grunt.registerTask('dist', ['string-replace', 'jshint', 'copy']);
  grunt.registerTask('deploy', ['ftp-deploy']);
  grunt.registerTask('dev', ['connect', 'watch']);

};