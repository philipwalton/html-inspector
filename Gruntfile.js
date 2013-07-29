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
      dom_utils_test: {
        src: [
          "test/dom-utils/*.js"
        ],
        dest: "test/dom-utils-test.js"
      },
      html_inspector_test: {
        src: [
          "test/html-inspector/*.js",
          "test/html-inspector/modules-intro.txt",
          "test/html-inspector/modules/*.js",
          "test/html-inspector/modules-outro.txt",
          "test/html-inspector/rules-intro.txt",
          "test/html-inspector/rules/*.js",
          "test/html-inspector/rules-outro.txt"
        ],
        dest: "test/html-inspector-test.js"
      }
    },

    browserify: {
      dist: {
        src: "src/html-inspector.js",
        dest: "dist/<%= pkg.name %>.js",
        options: {
          // debug: true,
          standalone: "HTMLInspector"
          // transform: ["brfs"]
        }
      },
      dom_utils_test: {
        src: "test/dom-utils-test.js",
        dest: "test/dom-utils-test.js",
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      src: {
        src: "src/**/*.js"
      },
      classes_test: {
        src: "test/classes/**/*.js"
      },
      html_inspector_test: {
        src: "test/html-inspector/**/*.js"
      },
      dom_utils_test: {
        src: "test/dom-utils/**/*.js"
      }
    },

    watch: {
      gruntfile: {
        files: ["Gruntfile.js"],
        tasks: ["default"]
      },
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
      src: "test/classes/**/*.js"
    },

    mocha_phantomjs: {
      html_inspector: {
        src: "test/html-inspector-test.html"
      },
      dom_utils: {
        src: "test/dom-utils-test.html"
      }
    }
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-jshint")
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-browserify")
  grunt.loadNpmTasks("grunt-mocha-cli")
  grunt.loadNpmTasks("grunt-mocha-phantomjs")

  grunt.registerTask("test:classes", [
    "jshint:classes_test",
    "mochacli"
  ])

  grunt.registerTask("test:dom_utils", [
    "jshint:dom_utils_test",
    "concat:dom_utils_test",
    "browserify:dom_utils_test",
    "mocha_phantomjs:dom_utils"
  ])

  grunt.registerTask("test:html_inspector", [
    "jshint:html_inspector_test",
    "concat:html_inspector_test",
    "browserify:dist",
    "mocha_phantomjs:html_inspector"
  ])

  grunt.registerTask("test", [
    "test:classes",
    "test:dom_utils",
    "test:html_inspector"
  ])

  grunt.registerTask("default", [
    "jshint:src",
    "test",
    "browserify:dist",
    "concat:dist"
  ])

}