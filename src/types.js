/*
 * @flow
 */

type SagaError = {
  message :string;
  status :number;
  statusText :string;
};

type SelectOption = {
  label :string;
  value :string;
};

export type {
  SagaError,
  SelectOption,
};
