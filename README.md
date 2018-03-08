
# Static Starter Kit

This project borns from my daily work needs.

I needed something able to let me quickly set up a fully static website structure, based on Gulp, Yarn, Pug, Sass and JavaScript.
During the time I improved it since I decided to publish it as a public repository, here on GitHub!

Hope that share it can help who is looking for a stable and effective structure for static websites, so easy to set up and work with.

## :sparkles: Features

- **Sass superpowers!** — Sass is included and it brings you a lot of new possibilities: variables, mixins, extends and many more
- **Future JS in your hands** — thanks to Babel, you can write beautiful ES2016 JS since now
- **Pug** - Yeah, HTML is not so bad, but Pug rocks! It brings awesome features like functions, imports, variables and many more to your templates.
- **A lint to rule them all** — You can not do it wrong! Stylelint, ESLint and PugLint are here to help you to code it cleanly
- **Modular components architecture** — Both templates and styles are divided into folders following a supermodular architecture
- **Built-in HTTP Server** - A built-in server for previewing your site locally is included
- **It's so tiny!** - Every single line of HTML, JS and CSS is concatenated and minified. Your pages will load super fast!
- **PageSpeed Insights** - Thanks to Ngrok, you can test your website with Google PageSpeed directly from your local machine
- **A fast dependency manager** — Yarn is here, ready to help you to fast extend your project

## :zap: Quickstart

1. First of all, you will need **Node.js**. You can download it from the [offical website](https://nodejs.org/it/) and follow the installation process for your OS.
2. Then you'll need **Gulp**. To install it, follow instruction described [here](https://gulpjs.com/)
3. The last thing to install is **Yarn**, the dependency manager. Follow the steps described on the [website](https://yarnpkg.com/en/docs/getting-started)
4. Now you can install all dependencies: `npm install && yarn install`
5. Finally, build everything with `gulp build`

Great: you can now start to use Static StarterKit! :smile:

## :mag: What's behind the scenes?

Are you curious to know what's happening behind the scenes?
So here below you can find a detailed list of the already defined Gulp tasks. Have fun!
### :hammer: Style files

All Sass files should be placed into the `src/styles` folder and are divided following a modular architecture.

The Gulp tasks for styles are:

1. `styles:lint` — takes care of linting, following rules described in the `.stylelintrc` file. To know how to customize that file, have a look at the [Stylelint documented rules](https://stylelint.io/user-guide/rules/). As the default, it's set to check `hyphenatedbem` — from [BEM](http://getbem.com/) — as class name format convention. To know how to use or customize it, follow [this doc](https://github.com/davidtheclark/stylelint-selector-bem-pattern). Before linting, the task runs also `csscomb` to sort properties following what described in [SMACSS rules](https://smacss.com/book/formatting). You can change these settings in the `.csscomb.json` file
2. `styles:compile` — compiles Sass into CSS, adding autoprefixes. Compiled files are written into the `.tmp` folder
3. `styles:minify` — uses `cssmin` to generate a minified version in the `dist` folder. Also generates sourcemaps (if `--production` option is not used)

### :hammer: Script files

All JavaScript files are placed in `src/scripts` folder.

The Gulp tasks for scripts are:

1. `scripts:lint` — takes care of linting, following rules described in the `.eslintrc.json` file. To know how to customize that file, have a look at the [ESLint documented rules](https://eslint.org/docs/rules/)
2. `scripts:transpile` — uses Babel to transpiles ES2016 JavaScript into browser-compatible JavaScript. Compiled files are written in the `.tmp` folder
3. `scripts:minify` — uses `uglify` to generate a minified version in the `dist` folder. Also generates sourcemaps (if `--production` option is not used)

### :hammer: Template files

All Pug files are placed in `src/templates` folder. Files prefixed with an
underscore are not compiled individually but are used for includes.

The Gulp workflow for templates is:

1. `templates:lint` — takes care of lint, following rules described in the `.pug-lintrc.json` file. To know how to customize that file, have a look at the [pug-lint documented rules](https://github.com/pugjs/pug-lint/blob/master/docs/rules.md)
2. `templates:compile` — compiles Pug files into HTML5. If `--production` option is used, the output HTML5 it will be compressed as well
3. `templates:htaccess` — copies the `.htaccess` file from the `src` folder to the `dist` one
4. `templates:injectCSS` — uses `gulp-inject` to inject CSS resources where `<!-- inject:css ->` comment is placed
5. `templates:injectJS` — uses `gulp-inject` to inject JS resources where `<!-- inject:js ->` comment is placed

### :hammer: Images and Fonts

All fonts are flattened and moved from the `src` folder to the `dist/fonts` folder.

All images, instead, are compressed using `gulp-imagemin`. More plugin options are described [here](https://www.npmjs.com/package/gulp-imagemin#custom-plugin-options)

### :hammer: Google Page Speed

Uses ngrok + PSI to locally test Google Page Speed performances.

## :computer: Contribute

Any kind of contribute is welcome! If you notice something wrong please open an issue [here](https://github.com/LucaPipolo/static-starterkit/issues) and, eventually, provide a patch using pull requests.

## :pencil2: License

[GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html) © [Luca Pipolo](https://www.lucapipolo.com)
