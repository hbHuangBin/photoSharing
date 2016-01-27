module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			jsdoc: ['build/doc-backend']
		},
		jasmine_nodejs: {
			// task specific (default) options
			options: {
				specNameSuffix: "spec.js", // also accepts an array
				helperNameSuffix: "helper.js",
				useHelpers: false,
				stopOnFailure: false,
				// configure one or more built-in reporters
				reporters: {
					console: {
						colors: true,
						cleanStack: 1,       // (0|false)|(1|true)|2|3
						verbosity: 4,        // (0|false)|1|2|3|(4|true)
						listStyle: "indent", // "flat"|"indent"
						activity: false
					},
				}
			},
			modules: {
				// target specific options
				options: {
					useHelpers: true
				},
				// spec files
				specs: [
					"test/specs/**",
				],
				helpers: [
					"test/helpers/**"
				]
			}
		},
		jsdoc: {
			backend: {
				src: ['modules/**/*.js'],
				options: {
					destination: 'build/doc-backend',
					template: 'node_modules/jaguarjs-jsdoc-patched-2',
					configure: 'config/jsdoc-conf.json'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jasmine-nodejs');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('default', ['jasmine_nodejs']);
	grunt.registerTask('gen_docs', ['clean:jsdoc', 'jsdoc']);
};
