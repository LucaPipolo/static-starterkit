# Why this project?
This project borns from my daily work needs.
I needed something able to let me quickly set up a fully static website structure,
based on Gulp, Bower, Pug, Sass and JavaScript.
During the time I improved it since I decided to publish it as repository here
on GitHub.
Hope that share it can help who are looking for a stable and effective structure
for static websites, so easy to set up and work with.

# Install
- First of all, you will need Node.js. You can download it from the [offical website]
(https://nodejs.org/it/) and follow the installation process for your OS.
- Then you'll need Gulp. To install it, follow instruction described [here]
(https://gulpjs.com/).
- Finally, you had to install Bower to manage your libraries. To do that, follow
[official documentation](https://bower.io/#install-bower).

Lastly, don't forgot to run `npm install && bower install` to install all
dependencies and packages needed.

Great! You're now able to use the awesome Static StarteKit. :)

# Use
Here below main tasks and processes are described, to let you know how quickly
start to use the kit.

## Bower injection
All libraries installed through Bower and saved in the `bower.json` file, will
be processed and compressed in two different files: `libs.min.css` for style
files and `libs.min.js` for script files.

Fonts and imags coming from Bower, instead, are simply flattened, compressed and
copied to the respective dist folders.

Please note that Bower packages can be also overrided by the `overrides`
property in the `bower.json` file.

## Template files
All Pug files are placed in `src/templates` folder. Files prefixed with an
underscore are not compiled individually but are used for includes.

The Gulp workflow for templates is:

1. `lint:pug` — takes care of lint, following rules described in the
`.pug-lintrc.json` file. To know how to customize that file, have a look at the
[pug-lint documented rules](https://github.com/pugjs/pug-lint/blob/master/docs/rules.md).
2. `compile:pug` — compiles Pug files into HTML5.

## Style files
All Sass files are placed in `src/styles` folder and are divided following the
[SMACSS](https://smacss.com/) rules.

The Gulp workflow for styles is:

1. `lint:sass` — takes care of lint, following rules described in the
`.sass-lint.yml` file. As default, it's set to check `hyphenatedbem`
— from [BEM](http://getbem.com/) — as class name format convention.
To know how to customize that file, have a look at the [sass-lint documented rules]
(https://github.com/sasstools/sass-lint/tree/master/docs/rules).
Before linting, the task runs also `csscomb` to sort properties following
[SMACSS rules](https://smacss.com/book/formatting). You can change these
settings in the `.csscomb.json` file.
2. `compile:sass` — first, generates source maps, then compiles Sass to CSS and
finally auto prefixes it. Compiled files are written in the `.tmp` folder.
3. `minify:css` — uses `cssmin` to generate a minified version in the `dist`
folder.

## Script files
All JavaScript files are placed in `src/scripts` folder.

The Gulp workflow for scripts is:

1. `lint:js` — takes care of lint, following rules described in the
`.eslintrc.json` file. To know how to customize that file, have a look at the
[ESLint documented rules](https://eslint.org/docs/rules/).
2. `transpile:es2016` — first generates source maps, then transpile ES2015 JavaScript
into browser-compatible JavaScript. Compiled files are written in the `.tmp` folder.
3. `minify:js` — uses `uglify` to generate a minified version in the `dist`
folder. License comments are preserved as default.

## Images and Fonts
All fonts are moved to the `dist/fonts` folder.

All images, instead, are compressed using `gulp-imagemin` plugin. More plugin
options are described [here](https://www.npmjs.com/package/gulp-imagemin#custom-plugin-options)

# Contribute
Any kind of contribute is welcome! If you notice something wrong please open an
issue [here](https://github.com/LucaPipolo/static-starterkit/issues) and,
 eventually, provide a patch using pull requests.

Thanks!

# License
[GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html) ©
[Luca Pipolo](https://www.lucapipolo.com)
