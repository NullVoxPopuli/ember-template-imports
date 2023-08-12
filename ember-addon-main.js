'use strict';
require('validate-peer-dependencies')(__dirname);
let VersionChecker = require('ember-cli-version-checker');
let { addPlugin, hasPlugin } = require('ember-cli-babel-plugin-helpers');

module.exports = {
  name: require('./package').name,

  included(includer) {
    this._super.included.apply(this, arguments);

    let emberChecker = new VersionChecker(this.project).for('ember-source');

    if (!emberChecker.gte('3.27.0')) {
      throw new Error(
        'ember-template-imports requires ember-source 3.27.0 or higher'
      );
    }

    let staticBlocks = require.resolve(
      '@babel/plugin-transform-class-static-block'
    );

    addPlugin(includer, staticBlocks);

    let pluginPath = require.resolve('babel-plugin-ember-template-compilation');
    let ember = this.project.findAddonByName('ember-source');

    if (!hasPlugin(includer, pluginPath)) {
      addPlugin(includer, [
        pluginPath,
        {
          targetFormat: 'wire',
          compilerPath: ember.absolutePaths.templateCompiler,
        },
      ]);
    }
  },

  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      let TemplateImportPreprocessor = require('./src/preprocessor-plugin');
      registry.add('js', new TemplateImportPreprocessor());
    }
  },
};
