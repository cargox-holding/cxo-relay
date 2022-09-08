import { LogMessage } from '../logMessage';
import { useLogs } from '../../../utils/hooks';
import { Box, Text } from 'ink';

export function Logs() {
  const { logs } = useLogs();
  return (
    <Box marginTop={1} flexDirection="column">
      <Text bold>Logs</Text>
      <Box flexDirection="column">
        {logs.map((log) => (
          <LogMessage key={log.id} {...log} />
        ))}
      </Box>
    </Box>
  );
}
