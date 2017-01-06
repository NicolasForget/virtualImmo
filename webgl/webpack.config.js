var path = require('path');
var DashboardPlugin = require('webpack-dashboard/plugin');
var webpack = require('webpack');

module.exports = {
    entry: ['babel-polyfill', path.join(__dirname, "src")],

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },

    plugins: [
        new DashboardPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    module: {
        postLoaders: [
            {
                test: /\.js$/,
                loader: "transform/cacheable?brfs"
            }
        ],
        loaders: [
            {
                test: /\.js?|\.jsx?$/,
                loader: 'babel',
                include: path.join(__dirname, 'src'),
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff)$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.scss|\.css$/,
                loaders: ["style", "css", "sass"]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }
        ]
    },
    devtool: 'source-map',
    node: {
        fs: 'empty'
    }
};
