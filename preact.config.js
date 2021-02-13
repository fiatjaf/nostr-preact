export default (config, env, helpers) => {
  let { rule } = helpers.getLoadersByName(config, 'babel-loader')[0];
  let babelConfig = rule.options;

  babelConfig.presets[0][1].exclude.push('@babel/plugin-transform-exponentiation-operator');
  // babelConfig.env = {
  //   // ...some settings...
  // }
};
