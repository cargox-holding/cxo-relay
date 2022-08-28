import styles from './styles.module.scss';
import React from 'react';
import clsx from 'clsx';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormGroupProps {
  name: string;
  label: string;
  helpText?: string;
  errorMessage?: string;
  inputProps: UseFormRegisterReturn;
  dirty: boolean;
  value: string;
}

export function FormGroup({
  name,
  label,
  helpText,
  errorMessage,
  inputProps,
  dirty,
  value,
}: FormGroupProps) {
  const valid = !errorMessage;
  const displayValidation = dirty || value || !valid;
  return (
    <div
      className={clsx(
        styles.formGroup,
        displayValidation ? (valid ? styles.valid : styles.invalid) : {}
      )}
    >
      <label htmlFor={name}>{label}</label>
      <div className={styles.formField}>
        <input id={name} type="text" {...inputProps} />
      </div>
      {helpText && <div className={styles.formHelp}>{helpText}</div>}
      {errorMessage && <div className={styles.formError}>{errorMessage}</div>}
    </div>
  );
}
