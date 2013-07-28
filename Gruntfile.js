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
      + " */\n\n",

    // Task configuration.
    concat: {
      options: {
        separator: "\n",
        stripBanners: true
      },
      dist: {
        options: { banner: "<%= banner %>" },
        src: "dist/<%= pkg.name %>.js",
        dest: "dist/<%= pkg.name %>.js"
      },
      test: {
        src: [
          "test/browser/*.js",
          "test/browser/modules-intro.txt",
          "test/browser/modules/*.js",
          "test/browser/modules-outro.txt",
          "test/browser/rules-intro.txt",
          "test/browser/rules/*.js",
          "test/browser/rules-outro.txt"
        ],
        dest: "test/browser.js"
      },
    },
    // autoinclude: {
    //   rules: {
    //     src: "src/rules/**/*.js",
    //     dest: "src/html-inspector.rules.js"
    //   },
    //   modules: {
    //     src: "src/modules/**/*.js",
    //     dest: "src/html-inspector.modules.js"
    //   }
    // },
    browserify: {
      dist: {
        src: "src/html-inspector.js",
        dest: "dist/<%= pkg.name %>.js",
        options: {
          // debug: true,
          standalone: "HTMLInspector"
          // transform: ["brfs"]
        }
      }

    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      all: {
        src: "src/**/*.js"
      },
      dist: {
        src: "<%= concat.dist.dest %>"
      },
      spec: {
        src: "<%= concat.spec.dest %>"
      },
      test: {
        src: "test/**/*.js"
      },
      src: {
        src: "src/**/*.js"
      }
    },
    watch: {
      // scripts: {
      //   files: ["src/**/*.js"],
      //   tasks: ["concat:dist", "strip-test-code:dist", "jshint:dist"]
      // },
      // spec: {
      //   files: ["spec/src/**/*.js"],
      //   tasks: ["concat:spec", "jshint:spec"]
      // },
      // gruntfile: {
      //   files: ["Gruntfile.js"],
      //   tasks: ["default"]
      // },
      test: {
        files: ["test/browser/**/*.js"],
        tasks: ["jshint:test", "concat:test"]
      },
      src: {
        files: ["src/**/*.js"],
        tasks: ["jshint:src", "browserify"]
      }

    },
    mochacli: {
      src: "test/node/**/*.js"
    },
    mocha_phantomjs: {
      src: "test/browser.html"
    }
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-jshint")
  grunt.loadNpmTasks("grunt-contrib-watch")
  // grunt.loadNpmTasks("grunt-contrib-jasmine")
  grunt.loadNpmTasks("grunt-browserify")
  grunt.loadNpmTasks("grunt-mocha-cli")
  grunt.loadNpmTasks("grunt-mocha-phantomjs")


  // grunt.registerMultiTask("autoinclude", "auto include rule and module files", function() {
  //   var target = this.target
  //   this.files.forEach(function(f) {
  //     var includes = ""
  //     f.src.forEach(function(filepath) {
  //       var path = require("path")
  //         , requirePath = "./" + path.relative("./src", filepath)
  //       includes += "HTMLInspector." + target + ".add( require(\"" + requirePath + "\") )\n"
  //     });
  //     grunt.file.write(f.dest, includes)
  //   });
  // })

  // Default task.
  // grunt.registerTask("default", ["concat", "strip_code", "jshint"])
  grunt.registerTask("default", [
    "jshint:src",
    "browserify:dist",
    "concat:dist"
  ])

  grunt.registerTask("test", ["test:node", "test:browser"])
  grunt.registerTask("test:node", ["mochacli"])
  grunt.registerTask("test:browser", ["default", "concat:test", "mocha_phantomjs"])

  // grunt.registerTask("test", ["concat", "jshint", "jasmine"])
  // grunt.registerTask("test:dist", ["concat", "jshint", "jasmine:dist"])
  // grunt.registerTask("test:builds", ["concat", "jshint", "jasmine:builds"])

}