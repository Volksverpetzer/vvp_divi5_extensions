const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'scripts'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  externals: {
    react: ['vendor', 'React'],
    'react-dom': ['vendor', 'ReactDOM'],
    '@wordpress/hooks': ['vendor', 'wp', 'hooks'],
    '@wordpress/i18n': ['vendor', 'wp', 'i18n'],
    '@divi/module': ['divi', 'module'],
    '@divi/module-library': ['divi', 'moduleLibrary'],
    '@divi/types': ['divi', 'types'],
    '@divi/icon-library': ['divi', 'iconLibrary'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../styles/[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/**/*.scss',
          to: '../styles/bundle.css',
          transformAll: (assets) => {
            return Buffer.concat(assets.map((asset) => asset.data));
          },
        },
        {
          from: '**/module.json',
          context: 'src/components',
          to: path.resolve(__dirname, 'modules-json'),
        },
        {
          from: '**/module-default-render-attributes.json',
          context: 'src/components',
          to: path.resolve(__dirname, 'modules-json'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  devtool: isProduction ? false : 'source-map',
};
