module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON("package.json"),
    banner: "/*!\n"
      + " * <%= pkg.title %> - v<%= pkg.version %>\n"
      + " *\n"
      + " * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %> <<%= pkg.author.url %>>\n"
      + " * Released under the <%= pkg.license %> license\n"
      + " *\n"
      + " * Date: <%= grunt.template.today('yyyy-mm-dd') %>\n"
      + " */\n",
    // Task configuration.
    concat: {
      dist: {
        options: {
          banner: "<%= banner %>",
          stripBanners: true
        },
        src: [
          "src/intro.js",
          "src/utils.js",
          "src/inspector.js",
          "src/stylesheets.js",
          "src/outro.js",
          "src/rules/**/*.js",
          "src/reports/**/*.js"
        ],
        dest: "dist/<%= pkg.name %>.js"
      },
      spec: {
        src: [
          "spec/src/intro.js",
          "spec/src/stylesheets-spec.js",
          "spec/src/rules-intro.js",
          "spec/src/rules/*.js",
          "spec/src/rules-outro.js",
          "spec/src/outro.js"
        ],
        dest: "spec/html-inspector-spec.js"
      }
    },
    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      dist: {
        src: "<%= concat.dist.dest %>",
        dest: "dist/<%= pkg.name %>.min.js"
      }
    },
    jshint: {
      options: grunt.file.readJSON(".jshintrc"),
      dist: {
        src: "<%= concat.dist.dest %>"
      },
      spec: {
        src: "<%= concat.spec.dest %>"
      }
    },
    watch: {
      scripts: {
        files: ["src/**/*.js"],
        tasks: ["concat:dist", "jshint:dist"]
      },
      spec: {
        files: ["spec/src/**/*.js"],
        tasks: ["concat:spec", "jshint:dist"]
      },
      gruntfile: {
        files: ["Gruntfile.js"],
        tasks: ["default"]
      }
    },
    jasmine: {
      options: {
        vendor: "lib/jquery.js",
        specs: "spec/html-inspector-spec.js",
        styles: "spec/html-inspector-spec.css",
        outfile: "spec-runner.html",
        keepRunner: true
      },
      src: ["dist/html-inspector.js"],
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask("default", ["concat:dist", "jshint:dist", "uglify:dist"]);

  grunt.registerTask("test", ["concat", "jshint", "jasmine"]);

};