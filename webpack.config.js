const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const commonExternals = {
  '@wordpress/hooks': ['vendor', 'wp', 'hooks'],
  '@wordpress/i18n': ['vendor', 'wp', 'i18n'],
  '@divi/module': ['divi', 'module'],
  '@divi/module-library': ['divi', 'moduleLibrary'],
  '@divi/types': ['divi', 'types'],
  '@divi/icon-library': ['divi', 'iconLibrary'],
};

module.exports = [
  // 1: DIVI 5 Visual Builder Bundle
  {
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
      ...commonExternals,
      react: ['vendor', 'React'],
      'react-dom': ['vendor', 'ReactDOM'],
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
  },
  // 2: Frontend Bundle Fact Check
  {
    mode: isProduction ? 'production' : 'development',
    entry: './src/components/fact-check-search/frontend.tsx',
    output: {
      path: path.resolve(__dirname, 'scripts'),
      filename: 'fact-check-frontend.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    externals: {
      react: ['wp', 'element'],
      'react-dom': ['wp', 'element'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          options: { transpileOnly: true },
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devtool: isProduction ? false : 'source-map',
  },
  // 3: Frontend Bundle Content Overview (Instagram Slideshow)
  {
    mode: isProduction ? 'production' : 'development',
    entry: './src/components/content-overview/frontend.tsx',
    output: {
      path: path.resolve(__dirname, 'scripts'),
      filename: 'content-overview-frontend.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    externals: {
      react: ['wp', 'element'],
      'react-dom': ['wp', 'element'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          options: { transpileOnly: true },
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devtool: isProduction ? false : 'source-map',
  }
];
