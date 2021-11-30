var path = require("path");
var BundleTracker = require('webpack-bundle-tracker');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
    mode: 'production',
    context: __dirname,
    entry: {
        main: './src/js/main.js',
    },
    output: {
        path: path.resolve('./fb_phoneauth/static/fb_phoneauth/'),
        filename: "[name].js",
        chunkFilename: "[name].js",
        clean: true,
    },

    plugins: [
        new BundleTracker({ filename: './webpack-stats.json' }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css',
        }),
    ],

    module: {
        rules: [
            // we pass the output from babel loader to react-hot loader
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    // Creates `style` nodes from JS strings
                    // "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    "postcss-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            }
        ],
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx']
    },
    devtool: 'eval-source-map',
}