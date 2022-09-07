import { spawn } from 'child_process';
import concat from 'concat-stream';

type Options = {
  timeoutMs?: number;
};
// Runs the CLI commad
// Expects the source to be built already
export function runCli(args: string[], options: Options = {}) {
  const cxoRelayCmd = spawn('node', ['dist-cli/src/main-cli', ...args]);
  const promise = new Promise((resolve, reject) => {
    cxoRelayCmd.stderr.once('data', (err) => {
      reject(err.toString());
    });
    cxoRelayCmd.on('error', reject);
    cxoRelayCmd.stdout.pipe(
      concat((result) => {
        resolve(result.toString());
      })
    );
  });

  // Kill command after timeoutMs (if provided)
  if (options.timeoutMs) {
    setTimeout(() => {
      cxoRelayCmd.kill();
    }, options.timeoutMs);
  }

  return promise;
}
