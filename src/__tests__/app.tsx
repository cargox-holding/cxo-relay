import * as React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import { Wrapper } from '../test/wrapper';

test('check if the app renders', () => {
  const { baseElement } = render(<App />, {
    wrapper: Wrapper,
  });
  expect(baseElement).toBeTruthy();
});
