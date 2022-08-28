import { rest } from 'msw';

import signaturesJson from './mock-signature-data.json';
import testData from './mock-api-data';

export const handlers = [
  rest.get(testData.relayApi, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(signaturesJson));
  }),
  rest.get(testData.relayConstantsApi, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        cxo_address: testData.cxoAddress,
        relay_address: testData.relayAddress,
      })
    );
  }),
  rest.get(testData.polygonNodeURL, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];
