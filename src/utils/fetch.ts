/* eslint-disable @typescript-eslint/no-var-requires */

// Since we are sharing code between electron (browser)
// and node, we need to check if we have fetch defined.
let fetch = globalThis?.fetch;
if (typeof fetch == 'undefined') {
  // We are in a fetch-less environment, use node-fetch
  const nodeFetch = require('node-fetch');
  fetch = nodeFetch as typeof fetch;
}

// Depending on this the module exports either the browser's fetch or node-fetch.
export default fetch;
