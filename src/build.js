const fs = require('fs');
const util = require('util');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
console.time('Build script took');
console.log('Building HTML file...');
(async () => {
  try {
    let result = await readFile(path.join(__dirname, '/www/dev.html'), 'utf8');
    result = result.replace(/<script id="websocket">[^]*<\/script>/, '');
    console.log('Hot reload Web Socket script tags removed...');
    const regex1 = new RegExp(
      /<script class="border-wallets-dev-script" src="(?<path>...*)">[^]*?</
    );
    let array1 = regex1.exec(result);
    while (array1 !== null) {
      const scriptLocation = path.join(__dirname, `/www/`, `${array1[1]}`);
      console.log(`Adding script from ${scriptLocation}`);
      const js = await readFile(scriptLocation, 'utf8');
      result = result.replace(
        array1[0],
        `<script>
      ${js}
      <`
      );
      array1 = regex1.exec(result);
      console.log('Done!');
    }
    const regex2 = /<link rel="stylesheet" href="(?<path>...*)?">/;
    let array2 = regex2.exec(result);
    while (array2 !== null) {
      const scriptLocation = path.join(__dirname, `/www/`, `${array2[1]}`);
      console.log(`Adding Stylesheet from ${scriptLocation}`);
      const css = await readFile(scriptLocation, 'utf8');
      result = result.replace(
        array2[0],
        `<style>
      ${css}
      </style>`
      );
      array2 = regex2.exec(result);
      console.log('Done!');
    }

    const output = path.join(__dirname, '../dist/borderwallets.html');
    const pwaOutput = path.join(__dirname, '../dist/index.html');
    const offlineOutput = path.join(
      __dirname,
      '../dist/borderwallets_offline.html'
    );
    const pwaHtml = result.replace(
      '<title>Bitcoin Border Wallets</title>',
      `<title>Bitcoin Border Wallets</title>
  <script src="/script.js" defer></script>
  <link rel="manifest" href="/manifest.json">
  <script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@pwabuilder/pwainstall"
  ></script>`
    );
    const offlineHtml = result.replace(
      '<title>Bitcoin Border Wallets</title>',
      `<title>OFFLINE EGG</title>`
    );
    await writeFile(output, result, 'utf8');
    await writeFile(pwaOutput, pwaHtml, 'utf8');
    await writeFile(offlineOutput, offlineHtml, 'utf8');
    console.log(`Task completed! Built file is available at ${output}`);
  } catch (error) {
    console.log('Build failed', error);
  }
  console.timeEnd('Build script took');
})();
