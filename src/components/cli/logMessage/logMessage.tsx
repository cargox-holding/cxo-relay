import { Box, Text } from 'ink';
import { LogEntry } from '../../../context/logs';

export function LogMessage({ timestamp, message, level }: LogEntry) {
  const datetime = new Date(timestamp).toLocaleTimeString();
  return (
    <Box>
      <Text>{datetime} </Text>
      <Text color={level == 'error' ? 'red' : undefined} bold>
        {message}
      </Text>
    </Box>
  );
}
