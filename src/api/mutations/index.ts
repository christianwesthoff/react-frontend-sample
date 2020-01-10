import { AxiosInstance } from 'axios';

export const DELETE_SUBSCRIBER = (client: AxiosInstance) => async ({
  id,
}: any) => {
  const res = await client.delete(
    `${process.env.REACT_APP_API_URL}/subscribers/${id}`
  );

  return res.data;
};

export const DELETE_FIELD = (client: AxiosInstance) => async ({ id }: any) => {
  const res = await client.delete(
    `${process.env.REACT_APP_API_URL}/fields/${id}`
  );

  return res.data;
};

export const CREATE_SUBSCRIBER = (client: AxiosInstance) => async ({
  data,
}: any) => {
  const res = await client.post(
    `${process.env.REACT_APP_API_URL}/subscribers`,
    data
  );

  return res.data;
};

export const UPDATE_SUBSCRIBER = (client: AxiosInstance) => async ({
  id,
  data,
}: any) => {
  const res = await client.put(
    `${process.env.REACT_APP_API_URL}/subscribers/${id}`,
    data
  );

  return res.data;
};

export const CREATE_FIELD = (client: AxiosInstance) => async ({
  data,
}: any) => {
  const res = await client.post(
    `${process.env.REACT_APP_API_URL}/fields`,
    data
  );

  return res.data;
};

export const UPDATE_FIELD = (client: AxiosInstance) => async ({
  id,
  data,
}: any) => {
  const res = await client.put(
    `${process.env.REACT_APP_API_URL}/fields/${id}`,
    data
  );

  return res.data;
};
