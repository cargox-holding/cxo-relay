import React from 'react';
import { compare } from 'compare-versions';
import styles from './styles.module.scss';
import { version as currentVersion } from '../../../../package.json';
import { useLatestVersion } from '../../../utils/hooks';

const RELEASE_DOWNLOAD_LINK =
  'https://github.com/cargox-holding/cxo-relay/releases';

function openDownloadPage() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron').shell.openExternal(RELEASE_DOWNLOAD_LINK);
}

export function Version() {
  const latestVersion = useLatestVersion();
  let newerAvailable = false;
  if (latestVersion) {
    newerAvailable = compare(latestVersion, currentVersion, '>');
  }
  return (
    <div className={styles.version}>
      v{currentVersion}{' '}
      {newerAvailable ? (
        <button onClick={openDownloadPage} className={styles.updateButton}>
          Update available
        </button>
      ) : null}
    </div>
  );
}
