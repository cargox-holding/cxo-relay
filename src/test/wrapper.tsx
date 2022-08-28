import { LogsProvider } from '../context/logs';

export const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <LogsProvider>{children}</LogsProvider>
);
