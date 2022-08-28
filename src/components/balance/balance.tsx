import styles from './styles.module.scss';
import React from 'react';

interface BalanceProps {
  title: string;
  value?: string;
  units: string;
}

export function Balance({ title, value, units }: BalanceProps) {
  return (
    <div className={styles.balance}>
      {title}
      <strong>
        <span>{value || '_'}</span>
        <span> {units}</span>
      </strong>
    </div>
  );
}
