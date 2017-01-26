var path = require('path');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

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
    }/*,
    plugins: [
        new ClosureCompilerPlugin({
          compiler: {
            language_in: 'ECMASCRIPT6',
            language_out: 'ECMASCRIPT5',
            compilation_level: 'ADVANCED'
          },
          concurrency: 3,
        })
    ]*/
};