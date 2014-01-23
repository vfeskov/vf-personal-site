var fs = require('fs'),
    bowerDeps = require('./build/bower-deps.js');
module.exports = function (params) {
    var grunt = params.grunt;

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.initConfig({
        clean: {
            public: {
                src: 'public'
            },
            tmp: {
                src: 'tmp'
            }
        },
        copy: {
            public: {
                files: [
                    {
                        src: ['assets/**/*.*', '!assets/**/*.css', '**/*.html', '!posts_content/**/*.html', '**/*.json', '**/*.xml', '!app/**/*.html'],
                        dest: 'public',
                        cwd: 'src/front',
                        expand: true
                    }
                ]
            },
            posts: {
                src: 'posts_content/**/*.html',
                dest: 'public',
                cwd: 'src/front',
                expand: true,
                options: {
                    process: require('./build/highlight.js')
                }
            }
        },
        html2js: {
            app: {
                options: {
                    base: 'src/front/app',
                    module: 'templates'
                },
                src: 'src/front/app/**/*.html',
                dest: 'tmp/templates.js'
            }
        },
        concat: {
            options: {
                process: function(src) {
                    return src.replace(/^\/\/.*?sourceMappingURL=.*$/gm, '');
                }
            },
            css: {
                src: bowerDeps.css('min').concat(['src/front/assets/**/*.css']),
                dest: 'tmp/all.css'
            },
            app: {
                src: ['tmp/templates.js', 'src/front/app/**/*.js'],
                dest: 'tmp/app.js'
            },
            vendor: {
                src: bowerDeps.js('min'),
                dest: 'tmp/vendor.js'
            },
            all: {
                src: ['tmp/vendor.js', 'tmp/app.min.js'],
                dest: 'tmp/all.js'
            }
        },
        uglify: {
            options: {
                banner: '/*\n vfPersonalSite v.0.1.0\n (c) 2014 Vladimir Feskov http://vfeskov.com\n License: MIT\n*/\n',
                mangle: true
            },
            app: {
                src: 'tmp/app.js',
                dest: 'tmp/app.min.js'
            }
        }
    });

    grunt.registerTask('insert', function () {
        var indexHtml = __dirname + '/../public/index.html',
            html = fs.readFileSync(indexHtml).toString(),
            js = fs.readFileSync(__dirname + '/../tmp/all.js').toString(),
            css = fs.readFileSync(__dirname + '/../tmp/all.css').toString();
        html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>');
        html = html.replace('</head>', '<script>\n' + js + '\n</script>\n</head>');
        fs.writeFileSync(indexHtml, html);
    });

    grunt.task.run([
        'clean', 'copy', 'html2js', 'concat:app', 'uglify:app', 'concat:vendor', 'concat:all', 'concat:css', 'insert', 'clean:tmp'
    ]);
};