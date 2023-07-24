const fs = require('fs');
const path = require('path');
const minifyHTML = require('html-minifier').minify;
const postcss = require('postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');

// const copyFile = (filePath, destinationPath) => {
//   fs.copyFileSync(path.join(__dirname, filePath), path.join(__dirname, destinationPath));
// }

// const processCSS = async (filePath, destinationPath) => {
//   const css = fs.readFileSync(filePath, 'utf-8');
//   const result = await postcss([
//     purgecss({
//       content: ['./src/**/*.html', './src/**/*.js'], // adjust this to match your actual content files
//       defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
//     }),
//     cssnano()
//   ]).process(css, { from: filePath, to: destinationPath });
//   fs.writeFileSync(destinationPath, result.css);
// }

function minifyAndCopyFile(filePath, destinationPath, type = 'txt') {
  const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

  switch (type) {
    case 'html':
      const minifiedHTML = minifyHTML(fileContent, {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true
      });
      fs.writeFileSync(path.join(__dirname, destinationPath), minifiedHTML);
      break;

    case 'css':
      postcss([autoprefixer, cssnano])
        .process(fileContent, { from: 'undefined' })
        .then(result => {
          fs.writeFileSync(path.join(__dirname, destinationPath), result.css);
        });
      break;

    default:
      fs.copyFileSync(path.join(__dirname, filePath), path.join(__dirname, destinationPath));
  }
}

minifyAndCopyFile('./src/index.html', './dist/index.html', 'html');
minifyAndCopyFile('./src/styles.css', './dist/styles.css', 'css');
minifyAndCopyFile('./src/favicon-32x32.png', './dist/favicon-32x32.png');
minifyAndCopyFile('./src/inter-v12-latin-500.woff2', './dist/inter-v12-latin-500.woff2');
minifyAndCopyFile('./src/inter-v12-latin-700.woff2', './dist/inter-v12-latin-700.woff2');
minifyAndCopyFile('./src/inter-v12-latin-regular.woff2', './dist/inter-v12-latin-regular.woff2');
// processCSS('./src/styles.css', './dist/styles.css');
