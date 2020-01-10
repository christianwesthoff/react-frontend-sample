import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  CircularProgress,
  Grid,
  Typography,
  TextField,
  Paper,
} from '@material-ui/core';
import { GET_FIELDS } from '../../../../api/queries';
import Field from '../../../../components/Field';
import { useHistory } from 'react-router-dom';
import { CREATE_SUBSCRIBER } from '../../../../api/mutations';
import {
  useAuthMutation,
  useAuthQuery,
  useShowError,
  useShowSuccess,
} from '../../../../hooks';

const CreateSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please provide a valid email address')
    .required('Please provide an email address'),
  name: Yup.string().required('Please provide a name'),
});

const Create = () => {
  const history = useHistory();
  const showSuccess = useShowSuccess();
  const showError = useShowError();

  const { data, isLoading } = useAuthQuery(
    ['GetAllFields', { paginate: false }],
    GET_FIELDS
  );

  const [createSubscriber, { isLoading: isCreating }] = useAuthMutation(
    CREATE_SUBSCRIBER,
    {
      refetchQueries: ['GetSubscribers'],
    }
  );

  const fields = data?.data || [];

  const initialValues = {
    name: '',
    email: '',
    fields: {
      ...fields.reduce(
        (acc: any, curr: any) => ({
          ...acc,
          [curr.id]: curr.type === 'boolean' ? false : '',
        }),
        {}
      ),
    },
  };

  return (
    <Grid container direction="column" alignItems="center">
      {isLoading ? (
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      ) : (
        <Formik
          validationSchema={CreateSchema}
          initialValues={initialValues}
          onSubmit={async (values, { setErrors }) => {
            try {
              await createSubscriber({
                data: {
                  ...values,
                  fields: Array.from(
                    Object.entries(values.fields),
                    ([id, value]) => ({ id, value })
                  ),
                },
              });

              showSuccess();
              history.push('/subscribers');
            } catch (e) {
              if (e.response && e.response.status === 422) {
                setErrors(e.response.data.errors);
              } else {
                showError();
              }
            }
          }}>
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            handleSubmit,
          }) => {
            const hasError = (fieldName: string) =>
              errors.hasOwnProperty(fieldName) &&
              touched.hasOwnProperty(fieldName);

            return (
              <Grid container item xs={4} spacing={2} component={Paper}>
                <Grid item xs={12}>
                  <Typography variant="h5">New Subscriber</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={hasError('email')}
                    value={values.email}
                    onBlur={handleBlur('email')}
                    onChange={handleChange('email')}
                    label="Email"
                    helperText={hasError('email') ? errors.email : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={hasError('name')}
                    value={values.name}
                    onBlur={handleBlur('name')}
                    onChange={handleChange('name')}
                    label="Name"
                    helperText={hasError('name') ? errors.name : ''}
                  />
                </Grid>
                {fields.map((field: any) => (
                  <Grid key={field.id} item xs={12}>
                    <Field
                      label={field.name}
                      type={field.type}
                      value={values.fields[field.id]}
                      onChange={(value: any) => {
                        setFieldValue(`fields.${field.id}`, value);
                      }}
                      onBlur={handleBlur(`fields.${field.id}`)}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    size="large"
                    disabled={isCreating}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleSubmit();
                    }}>
                    {isCreating ? (
                      <CircularProgress style={{ color: 'white' }} size={24} />
                    ) : (
                      'Create'
                    )}
                  </Button>
                </Grid>
              </Grid>
            );
          }}
        </Formik>
      )}
    </Grid>
  );
};

export default Create;
