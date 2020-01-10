import { AxiosInstance } from 'axios';

export const GET_SUBSCRIBERS = (client: AxiosInstance) => async ({
  limit,
  page,
}: any) => {
  const res = await client.get(`${process.env.REACT_APP_API_URL}/subscribers`, {
    params: {
      limit,
      page,
    },
  });

  return res.data;
};

export const GET_SUBSCRIBER = (client: AxiosInstance) => async ({
  id,
}: any) => {
  const res = await client.get(
    `${process.env.REACT_APP_API_URL}/subscribers/${id}`
  );

  return res.data;
};

export const GET_FIELDS = (client: AxiosInstance) => async ({
  limit = 10,
  page = 1,
  paginate = true,
}: any) => {
  const res = await client.get(`${process.env.REACT_APP_API_URL}/fields`, {
    params: {
      limit,
      page,
      paginate,
    },
  });

  return res.data;
};

export const GET_FIELD = (client: AxiosInstance) => async ({ id }: any) => {
  const res = await client.get(`${process.env.REACT_APP_API_URL}/fields/${id}`);

  return res.data;
};

export const GET_FIELD_TYPES = (client: AxiosInstance) => async () => {
  const res = await client.get(`${process.env.REACT_APP_API_URL}/field-types`);

  return res.data;
};
