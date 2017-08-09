var path = require('path');
var ClosureCompilerPlugin = require('webpack-closure-compiler');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    entry: './blakearchive/static/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'blakearchive/static/build')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
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