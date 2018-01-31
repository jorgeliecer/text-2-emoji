module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true
      },
      core: {
        src: ['src/scripts/tools.js', 'src/scripts/main.js'],
        dest: 'pre/core.js'
      },
      vendors: {
        src: ['src/scripts/vendors/*/*.js','src/scripts/vendors/*.js'],
        dest: 'pre/vendors.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! Why So Curious? jorelosorio@gmail.com <%= grunt.template.today("yyyy-mm-dd") %> */',
        preserveComments: false
      },
      entire: {
        src: ['pre/vendors.js', 'pre/core.js'],
        dest: 'dist/script/core.js'
      }
    },
    // obfuscator: {
    //   files: ['pre/core.js'],
    //   entry: 'script/core.js',
    //   out: 'pre/core.obfuscated.js',
    //   strings: true,
    //   root: __dirname
    // },
    cssmin: {
      options: {
        shorthandCompacting: true,
        roundingPrecision: -1,
        keepSpecialComments: 0
      },
      target: {
        files: {
          'dist/css/master.css': ['src/css/*.css']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'pre/index.html': ['src/index.html']
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          caseSensitive: true,
          minifyJS: true
        },
        files: {
          'dist/index.html': 'pre/index.html'
        }
      }
    },
    minjson: {
      compile: {
        files: {
          'dist/text2emoji-lang/es.json': 'src/text2emoji-lang/es.json'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          keepalive: true,
          base: {
            path: 'src',
            options: {
              index: 'index.html',
              maxAge: 1000
            }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-htmlmin')
  grunt.loadNpmTasks('grunt-processhtml')
  grunt.loadNpmTasks('grunt-minjson')
  grunt.loadNpmTasks('grunt-processhtml')
  grunt.loadNpmTasks('grunt-obfuscator')
  const {execFile} = require('child_process');
  const zopflipng = require('zopflipng-bin');

  grunt.registerTask('default', [])
  grunt.registerTask('serve', ['connect'])
  grunt.registerTask('build', ['concat:vendors','concat:core','uglify:entire','cssmin','processhtml','htmlmin','extract','optimize','minjson'])

  grunt.registerTask('optimize', "Optimize images", function() {
    var path = require('path')
    var fs = require('fs')
    var execSync = require('child_process').execSync;
    grunt.log.write('Loaded dependencies...').ok()

    var src_images_path = "src/images"
    var dist_path = "dist/images"

    fs.existsSync(dist_path) == false ? execSync("mkdir -p " + dist_path) : null

    if (fs.existsSync(src_images_path)) {
      var images = fs.readdirSync(src_images_path)
      for (var i = 0; i < images.length; i++) {
        if(path.extname(images[i]) == ".png") {
          var img_path =  src_images_path + "/" + images[i]
          var img_dist_path =  dist_path + "/" + images[i]
          if (!fs.existsSync(img_dist_path)) {
            execFile(zopflipng, ['-y', '--filters=01234mepb --lossy_8bit --lossy_transparent', img_path, img_dist_path], () => {
              console.log('Image minified!');
            });
          }
        }
      }
    }
  })
  grunt.registerTask('extract', 'Extract emojies', function() {
    var fs = require('fs')
    var execSync = require('child_process').execSync;
    grunt.log.write('Loaded dependencies...').ok()

    var emoji_src_path = "src/images/emojione"
    var emoji_dist_path = "dist/images/emojione"
    var emoji_pre_path = "pre/images/emojione"

    fs.existsSync(emoji_dist_path) == false ? execSync("mkdir -p " + emoji_dist_path) : null
    fs.existsSync(emoji_pre_path) == false ? execSync("mkdir -p " + emoji_pre_path) : null

    var json_lang = "src/text2emoji-lang/es.json"
    var emojies_to_move = []
    if (fs.existsSync(json_lang)) {
      var words = JSON.parse(fs.readFileSync(json_lang, 'utf8'));
      grunt.log.write('Loaded JSON...').ok()
      for (var i = 0; i < words.length; i++) {
        var emojies = words[i][1].split(",")
        for (var w = 0; w < emojies.length; w++) {
          var emoji = emojies[w].toLowerCase()
          if (emojies_to_move.indexOf(emoji) <= -1) {
            emojies_to_move.push(emoji)
          }
        }
      }

      // execSync("rm -f " + emoji_dist_path + "/*")
      // execSync("rm -f " + emoji_pre_path + "/*")

      for (var i = 0; i < emojies_to_move.length; i++) {
        var emoji_path =  emoji_src_path + "/" + emojies_to_move[i].toLowerCase() + ".png"
        var emoji_copre_path =  emoji_pre_path + "/" + emojies_to_move[i].toLowerCase() + ".png"
        var emoji_out_path =  emoji_dist_path + "/" + emojies_to_move[i].toLowerCase() + ".png"

        if (fs.existsSync(emoji_path)) {
          if (!fs.existsSync(emoji_out_path)) {
            var cmdRezie = "convert " + emoji_path + " -resize 32x32 " + emoji_copre_path
            grunt.log.write(cmdRezie)
            var stdout = execSync(cmdRezie)
            var cmd = "zopflipng --filters=01234mepb --lossy_8bit --lossy_transparent " + emoji_copre_path + " " + emoji_out_path
            grunt.log.write(cmd)
            var stdout = execSync(cmd)
            grunt.log.write(stdout)
          } else {
            grunt.log.write(emoji_out_path + " skip")
          }
        }
      }
    }
  })

};
