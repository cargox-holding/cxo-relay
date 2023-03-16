import * as React from 'react';
import { render } from 'ink-testing-library';
import testData from '../mocks/mock-api-data';
import { runCli } from '../test/run-cli';
import { Wrapper } from '../test/wrapper';
import Cli from '../components/cli/Cli';
import { waitFor } from '@testing-library/react';

test('display --help', async () => {
  const result = await runCli(['--help']);
  expect(result).toMatchInlineSnapshot(`
    "Usage: cxo-relay [options]

    CXO relay CLI utility

    Options:
      -V, --version           output the version number
      --key <keyOrMnemonic>   The private key or mnemonic phrase for the wallet
                              that holds MATIC that will be spent to relay
                              transactions
      --relayUrl <url>        The URL of the API endpoint to retrieve relay data
      --rpcUrl <url>          The Polygon node RPC URL
      --rewardAddr <address>  The address where CXO are stored on the Polygon
                              network (and where the reward will be sent to)
      --gas <price>           Custom gas price
      --gascap <price>        Custom gas price cap
      --doffa                 Proccess free for all documents
      -h, --help              display help for command
    "
  `);
});

test('test missing args', async () => {
  // Returns args, except the one on the specified index
  function getArgs(omitArgNumber: number) {
    const args = [
      '--key',
      testData.privateKey,
      '--relayUrl',
      testData.relayApi,
      '--rpcUrl',
      testData.polygonNodeURL,
      '--rewardAddr',
      testData.rewardAddress,
    ];
    args.splice(omitArgNumber, 2);
    return args;
  }

  try {
    await runCli(getArgs(0));
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`
      "error: required option '--key <keyOrMnemonic>' not specified
      "
    `);
  }
  try {
    await runCli(getArgs(2));
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`
          "error: required option '--relayUrl <url>' not specified
          "
      `);
  }
  try {
    await runCli(getArgs(4));
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`
          "error: required option '--rpcUrl <url>' not specified
          "
      `);
  }
  try {
    await runCli(getArgs(6));
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`
          "error: required option '--rewardAddr <address>' not specified
          "
      `);
  }
});

test('start processing', async () => {
  const { lastFrame } = render(
    <Wrapper>
      <Cli
        privateKeyOrMnemonic={testData.privateKey}
        relayUrl={testData.relayApi}
        rpcAddress={testData.polygonNodeURL}
        rewardCxoAddress={testData.rewardAddress}
        gasPrice={''}
        gasPriceCap={''}
        doffa={false}
      />
    </Wrapper>
  );
  waitFor(() => expect(lastFrame()).toContain('CXO balance'));
  waitFor(() => expect(lastFrame()).toContain('Matic balance'));
  waitFor(() => expect(lastFrame()).toContain('Fetched'));
});
