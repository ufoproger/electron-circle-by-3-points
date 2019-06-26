module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      js: {
        src: [
          'node_modules/three/build/three.min.js',
          'src/js/controls/OrbitControls.js',
          'src/js/objects/Sky.js',
          'node_modules/three.texttexture/THREE.TextTexture.js',
          'node_modules/three.textsprite/THREE.TextSprite.js',
          'src/libs/dat.gui/dat.gui.min.js',
          'node_modules/stats.js/build/stats.min.js',
        ],
        dest: 'docs/dist/libs.js',
      },
    },

    babel: {
      options: {
        sourceMap: false,
        presets: ['@babel/preset-env']
      },
      dist: {
        files: {
          'docs/dist/options.js': 'options.js',
          'docs/dist/solver.js': 'src/js/Solver.js',
          'docs/dist/renderer.js': 'renderer.js',
        }
      }
    },

    processhtml: {
      dist: {
        files: {
          'docs/index.html': ['index.html']
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-processhtml');

  grunt.registerTask('docs', ['concat', 'babel', 'processhtml']);
};