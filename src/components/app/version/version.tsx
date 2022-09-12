import styles from './styles.module.scss';
import button from 'styles/button.module.scss';
import { useLatestVersion } from '../../../utils/hooks';
import clsx from 'clsx';

const RELEASE_DOWNLOAD_LINK =
  'https://github.com/cargox-holding/cxo-relay/releases';

function openDownloadPage() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron').shell.openExternal(RELEASE_DOWNLOAD_LINK);
}

export function Version() {
  const { newerAvailable, currentVersion } = useLatestVersion();
  return (
    <div className={styles.version}>
      v{currentVersion}{' '}
      {newerAvailable ? (
        <div className={styles.updateAvailabel}>
          <h2>Update available</h2>
          <p>
            New version of CXO Relay is available. Go to GitHub and download
            latest version.
          </p>
          <button
            onClick={openDownloadPage}
            className={clsx(
              button.button,
              button.buttonWhite,
              button.buttonSmall
            )}
          >
            Update
          </button>
        </div>
      ) : null}
    </div>
  );
}
