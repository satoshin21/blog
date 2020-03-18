"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = insertCodeThemeCss;

var _styleFactory = _interopRequireDefault(require("./styleFactory"));

var _a11yDark = _interopRequireDefault(require("./prismCodeThemes/a11y-dark.css"));

var _atomDark = _interopRequireDefault(require("./prismCodeThemes/atom-dark.css"));

var _base16AteliersulphurpoolLight = _interopRequireDefault(require("./prismCodeThemes/base16-ateliersulphurpool.light.css"));

var _cb = _interopRequireDefault(require("./prismCodeThemes/cb.css"));

var _darcula = _interopRequireDefault(require("./prismCodeThemes/darcula.css"));

var _duotoneDark = _interopRequireDefault(require("./prismCodeThemes/duotone-dark.css"));

var _duotoneEarth = _interopRequireDefault(require("./prismCodeThemes/duotone-earth.css"));

var _duotoneForest = _interopRequireDefault(require("./prismCodeThemes/duotone-forest.css"));

var _duotoneLight = _interopRequireDefault(require("./prismCodeThemes/duotone-light.css"));

var _duotoneSea = _interopRequireDefault(require("./prismCodeThemes/duotone-sea.css"));

var _duotoneSpace = _interopRequireDefault(require("./prismCodeThemes/duotone-space.css"));

var _ghcolors = _interopRequireDefault(require("./prismCodeThemes/ghcolors.css"));

var _github = _interopRequireDefault(require("./prismCodeThemes/github.css"));

var _hopscotch = _interopRequireDefault(require("./prismCodeThemes/hopscotch.css"));

var _pojoaque = _interopRequireDefault(require("./prismCodeThemes/pojoaque.css"));

var _vs = _interopRequireDefault(require("./prismCodeThemes/vs.css"));

var _xonokai = _interopRequireDefault(require("./prismCodeThemes/xonokai.css"));

var insert = (0, _styleFactory.default)('highlight-code-theme');
// const availableCodeThemes = [
//   'a11y-dark',
//   'atom-dark',
//   'base16-ateliersulphurpool.light',
//   'cb',
//   'darcula',
//   'duotone-dark',
//   'duotone-earth',
//   'duotone-forest',
//   'duotone-light',
//   'duotone-sea',
//   'duotone-space',
//   'ghcolors',
//   'github',
//   'hopscotch',
//   'pojoaque',
//   'vs',
//   'xonokai',
// ];
var availableCodeThemes = {
  'a11y-dark': _a11yDark.default,
  'atom-dark': _atomDark.default,
  'base16-ateliersulphurpool.light': _base16AteliersulphurpoolLight.default,
  cb: _cb.default,
  darcula: _darcula.default,
  'duotone-dark': _duotoneDark.default,
  'duotone-earth': _duotoneEarth.default,
  'duotone-forest': _duotoneForest.default,
  'duotone-light': _duotoneLight.default,
  'duotone-sea': _duotoneSea.default,
  'duotone-space': _duotoneSpace.default,
  ghcolors: _ghcolors.default,
  github: _github.default,
  hopscotch: _hopscotch.default,
  pojoaque: _pojoaque.default,
  vs: _vs.default,
  xonokai: _xonokai.default
};

function insertCodeThemeCss(_ref) {
  var codeTheme = _ref.codeTheme;

  if (!codeTheme) {
    return;
  } // if (!availableCodeThemes.includes(codeTheme)) {


  if (!availableCodeThemes[codeTheme]) {
    codeTheme = 'github';
    console.warn("\nstorybook-readme: code theme \"".concat(codeTheme, "\" is not available.\n\nNOTE: in 5.0.2 changed highlight library to PrismJS so code theme also changed.  \nAvailable themes:: ").concat(Object.keys(availableCodeThemes).join(', '), ".\nhttps://github.com/PrismJS/prism-themes\n\n"));
  }

  insert({
    styles: availableCodeThemes[codeTheme]
  }); // import(`./prismCodeThemes/${codeTheme}.css.js`).then(t => {
  //   insert({
  //     styles: t.default,
  //   });
  // });
}