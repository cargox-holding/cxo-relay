import { Box, Text } from 'ink';
import { useLatestVersion } from '../../../utils/hooks';

export function Version() {
  const { newerAvailable, currentVersion } = useLatestVersion();
  return (
    <Box>
      <Text>Version: </Text>
      <Text color={newerAvailable ? 'yellow' : 'green'}>
        v{currentVersion} {newerAvailable ? '(update available)' : '(latest)'}
      </Text>
    </Box>
  );
}
