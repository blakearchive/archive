var path = require('path');
var ClosureCompilerPlugin = require('webpack-closure-compiler');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    entry: './blakearchive/static/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'blakearchive/static/build')
    },
    // Disable source maps to prevent 404 requests from crawlers
    devtool: false,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader'
                }]
            }
        ]
    },
    plugins: [
        new ngAnnotatePlugin({
            add: true,
            // other ng-annotate options here
        })/*,
        new ClosureCompilerPlugin({
          compiler: {
            compilation_level: 'SIMPLE'
          },
          concurrency: 3,
        })*/
    ]
};