import 'whatwg-fetch';
import '@testing-library/jest-dom';
import './src/mocks/dom.mock';
import { server } from './src/mocks/server';

beforeAll(() => {
  server.printHandlers();
  server.listen();
});
beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
