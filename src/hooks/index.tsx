import {useContext, useEffect} from 'react';
import { RootInstance, RootStoreContext } from '../models';
import {
  MutateFunction,
  MutationFunction,
  MutationOptions,
  MutationResult,
  QueryFunction,
  QueryKey,
  QueryOptions,
  QueryResult,
  useMutation,
  useQuery,
} from 'react-query';
import { SnackbarMessage, useSnackbar, VariantType } from 'notistack';
import axios, { AxiosInstance } from 'axios';
import { useHistory } from 'react-router-dom';

export const useClient = () => {
  const { auth } = useMst();
  const history = useHistory();
  const showError = useShowError();

  const client = axios.create({
    headers: {
      authorization: `Bearer ${auth.credentials.accessToken}`,
      accept: 'application/json',
    },
  });

  client.interceptors.response.use(
    res => res,
    async err => {
      if (err.config && err.response && err.response.status === 401) {
        try {
          await auth.refreshCredentials();
          err.config.headers.authorization = `Bearer ${auth.credentials.accessToken}`;
          return client.request(err.config);
        } catch (e) {
          auth.resetCredentials();
          showError('Your session expired, please login.');
          history.push('/login');
        }
      } else {
        return Promise.reject(err);
      }
    }
  );

  return client;
};

export const useAuthQuery = <TResult, TVariables extends object>(
  key: QueryKey<TVariables>,
  queryCreator: (client: AxiosInstance) => QueryFunction<TResult, TVariables>,
  options?: QueryOptions<TResult>
): QueryResult<TResult, TVariables> => {
  const showError = useShowError();
  const client = useClient();

  const { error, ...rest } = useQuery(key, queryCreator(client), options);

  useEffect(() => {
    if (error) {
      if (options?.onError) {
        options.onError(error);
      } else {
        showError();
      }
    }
  }, [error]);

  return { error, ...rest };
};

export const useAuthMutation = <TResults, TVariables extends object>(
  mutationCreator: (
    client: AxiosInstance
  ) => MutationFunction<TResults, TVariables>,
  options?: MutationOptions
): [MutateFunction<TResults, TVariables>, MutationResult<TResults>] => {
  const client = useClient();

  return useMutation(mutationCreator(client), options);
};

export const useMst = () => {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store as RootInstance;
};

export const useShowSnackbar = (
  defaultMessage: SnackbarMessage,
  type?: VariantType,
) => {
  const { enqueueSnackbar } = useSnackbar();

  return (message?: SnackbarMessage) => {
    enqueueSnackbar(message || defaultMessage, { variant: type || 'default' });
  };
};

export const useShowError = () => {
  return useShowSnackbar('Something went wrong !', 'error');
};

export const useShowSuccess = () => {
  return useShowSnackbar('Success !', 'success');
};
