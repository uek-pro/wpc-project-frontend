const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        contentBase: './dist',
        overlay: true,
        hot: true
    },
    resolve: {
        alias: {
          vue: 'vue/dist/vue.js'
        }
    },
    plugins: [
        new CopyWebpackPlugin(['index.html', 'main.css', 'main.css.map', 'icons.defs.svg', 'avatar.svg']),
        new webpack.HotModuleReplacementPlugin()
    ]
};