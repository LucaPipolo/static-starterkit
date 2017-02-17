# Install packages
First thing to do is to install all Node and Bower packages.
You can do that in one command, typing: `npm install && bower install`

# Variables
Since this starter-kit is created to work out of the box, you need to manually
set up some variables:  

- in `package.json` — name, description, repository url, author, and bugs url;
- in `bower.json` — name, description, authors, homepage;
- in `index.jade` — html lang;
- in `_head.jade` — title, meta description, meta keywords, meta author, Google Analytics ID;

# Resources
This starter-kit comes up with some basic external resources like jQuery and Fontello icons.
If you need to add some extra resources you can:

- bower packages — execute `bower install package-name --save` then set the `overrides` value in `bower.json` to be sure resources will be included in WireDep gulp task;
- fonts — simply add them to the fonts folder;
- icons — simply add them to the fonts folder. Basic icons was generated using Fontello so, if you like, you can also use the Fontello drag and drop feature to modify the default icon set;
- images — simply add them to the images folder;

# Workflow
Template files are located in the `assets/templates` folder. All templates that start with `_` prefix are not compiled as separate HTML files and so can be used only for include purpose.

Scss files are located in the `assets/styles` folder and are organized using [SMACSS core rules](https://smacss.com/). Gulp takes care to lint and compile them. Lint rules can be changed into `.scss-lint.yml` file.

Coffee files are located in the `assets/scripts` folder. Gulp takes care to lint and compile them. During the process a not minified version of the files will be created in `assets/scripts/tmp` folder: you can use these files for devepoment purpose since this folder is excluded from the git repo as default behaviour.

Images and fonts are both compressed and optimized by Gulp. New fonts can be declared into `_fonts.scss` file.

All the other external resources, e.g. bower packages, are processed, compiled and minified by Gulp into `libs.min.css` and `libs.min.js` files.
