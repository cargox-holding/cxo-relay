import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../components/app/App';
import testData from '../mocks/mock-api-data';
import { Wrapper } from '../test/wrapper';

test('test form happy path', async () => {
  const user = userEvent.setup();
  render(<App />, {
    wrapper: Wrapper,
  });

  await user.type(
    screen.getByLabelText('Your private key/Mnemonic'),
    testData.mnemonic
  );
  await user.type(
    screen.getByLabelText('Reward CXO address'),
    testData.rewardAddress
  );
  await user.type(screen.getByLabelText('Relay API URL'), testData.relayApi);
  await user.type(
    screen.getByLabelText('URL endpoint for Polygon node'),
    testData.polygonNodeURL
  );
  await user.click(screen.getByText('Start'));
  await waitForElementToBeRemoved(() => screen.queryByText(/start/i));
});

test('test wrong mnemonic/private key', async () => {
  const user = userEvent.setup();
  render(<App />, {
    wrapper: Wrapper,
  });

  await user.type(
    screen.getByLabelText('Your private key/Mnemonic'),
    'this is not a private key'
  );
  expect(screen.getByText(/invalid private key/i)).toBeInTheDocument();
});

test('test wrong CXO address', async () => {
  const user = userEvent.setup();
  render(<App />, {
    wrapper: Wrapper,
  });

  await user.type(
    screen.getByLabelText('Reward CXO address'),
    'this is not an address'
  );
  expect(
    screen.getByText(/please provide a valid address/i)
  ).toBeInTheDocument();
});

test('test wrong polygon URL', async () => {
  const user = userEvent.setup();
  render(<App />, {
    wrapper: Wrapper,
  });

  await user.type(
    screen.getByLabelText('URL endpoint for Polygon node'),
    'this is not a URL'
  );
  expect(screen.getByText(/provide a valid url/i)).toBeInTheDocument();
});

test('test wrong relay URL', async () => {
  const user = userEvent.setup();
  render(<App />, {
    wrapper: Wrapper,
  });

  await user.type(screen.getByLabelText('Relay API URL'), 'this is not a URL');
  expect(screen.queryByText(/provide a valid url/i)).toBeInTheDocument();
});
