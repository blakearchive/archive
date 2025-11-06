const path = require('path');

module.exports = {
    mode: 'production',
    entry: './blakearchive/static/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'blakearchive/static/build'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            }
        ]
    },
    optimization: {
        minimize: true
    },
    performance: {
        hints: false
    }
};