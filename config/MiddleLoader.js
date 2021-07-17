var loaderUtils = require('loader-utils');

module.exports = function(content) {
    if(this.cacheable) this.cacheable();
    var query = loaderUtils.getOptions(this) || {};
    var platform = query.platform;
    var importFile = `import * as json from './${platform}';`;
    var platformVar = `export const platform = '${platform}'`;
    return importFile + '\n' + platformVar + '\n' + content;
};
