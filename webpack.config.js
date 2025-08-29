const path = require('path');

module.exports = {
    mode: 'development',
    entry: './blakearchive/static/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'blakearchive/static/build'),
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "crypto": require.resolve("crypto-browserify"),
            "url": require.resolve("url/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "fs": false,
            "canvas": false,
            "xmldom": false,
            "jsdom": false
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /ng-openseadragon/, /services/, /controllers/, /directives/],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }]
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devtool: 'source-map'
};