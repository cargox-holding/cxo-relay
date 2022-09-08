import { Box, Text } from 'ink';

interface BalanceProps {
  title: string;
  value?: string;
  units: string;
}

export function Balance({ title, value, units }: BalanceProps) {
  return (
    <Box>
      <Text>{title} </Text>
      <Text bold>
        {value || '_'} {units}
      </Text>
    </Box>
  );
}
