process.env.NODE_ENV = 'production';
var webpack = require('webpack');
var config = require('../config/webpack.pro.config.js');

webpack(config).run((err, stats) => {
    if (err) {
        console.log('Failed to compile.', [err]);
        process.exit(1);
    }

    if (stats.compilation.errors.length) {
        console.log('Failed to compile.', stats.compilation.errors);
        process.exit(1);
    }

    console.log('build success');
});
