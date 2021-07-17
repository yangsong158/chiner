var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var platform = 'json';
if ([].concat(process.argv).splice(2, process.argv.length).includes('--web')) {
  platform = 'fetch';
}

var cpDir = [
  {
    from: path.resolve(__dirname, '../public'),
    to: path.resolve(__dirname, '../build')
  }
];

if (platform === 'json') {
  cpDir.push({
    from: path.resolve(__dirname, '../src/main.js'),
    to: path.resolve(__dirname, '../build')
  });
}

module.exports = {
  mode: "production",
  entry: {
    app: [require.resolve('@babel/polyfill'),
      path.resolve(__dirname, '../src/lib/Math'),
      path.resolve(__dirname, '../src/index')]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: "common",
          chunks: "all",
          minSize: 1,
          priority: 0
        },
        vendor: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10
        }
      }
    }
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: "[name].[chunkhash:8].min.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
      filename: 'index.html',
      minify: {
        // 压缩html
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer'
    }),
    new OptimizeCssAssetsPlugin({
      // 压缩css
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name].style.[hash].css',
    }),
    new CopyWebpackPlugin(cpDir)
  ],
  resolveLoader:{
    modules: ['node_modules','config']
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, '../src/components'),
      'style': path.resolve(__dirname, '../src/style/index.less')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|tsx|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(css|less)$/,
        loader: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader",
          { loader: "postcss-loader", options: { plugins: () => [ require('autoprefixer')() ]}},
          { loader: 'less-loader', options: {javascriptEnabled: true }}]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      },
      {
        test: require.resolve('../src/lib/middle'),
        loader: "MiddleLoader?platform=" + platform + ""
      },
    ]
  },
  target: 'electron-renderer'
}
