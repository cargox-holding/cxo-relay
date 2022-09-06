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

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    __esModule: true,
    ...originalModule,
    Contract: function () {
      return {
        address: testData.derivedAddress,
      };
    },
  };
});

test('test processing screen loads', async () => {
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
  await waitForElementToBeRemoved(() => screen.queryByText(/getting ready/i));
});
