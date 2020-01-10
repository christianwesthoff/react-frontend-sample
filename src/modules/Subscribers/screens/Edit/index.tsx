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
import { useHistory, useParams } from 'react-router-dom';
import { UPDATE_SUBSCRIBER } from '../../../../api/mutations';
import { GET_FIELDS, GET_SUBSCRIBER } from '../../../../api/queries';
import Field from '../../../../components/Field';
import {
  useAuthMutation,
  useAuthQuery,
  useShowError,
  useShowSuccess,
} from '../../../../hooks';

const UpdateSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please provide a valid email address')
    .required('Please provide an email address'),
  name: Yup.string().required('Please provide a name'),
});

const Edit = () => {
  const { subscriberId } = useParams();
  const history = useHistory();
  const showSuccess = useShowSuccess();
  const showError = useShowError();

  const { data: subscriber, isLoading: isLoadingSubscriber } = useAuthQuery(
    ['GetSubscriber', { id: subscriberId }],
    GET_SUBSCRIBER
  );

  const { data: availableFields, isLoading: isLoadingFields } = useAuthQuery(
    ['GetAllFields', { paginate: false }],
    GET_FIELDS
  );

  const [updateSubscriber, { isLoading: isUpdating }] = useAuthMutation(
    UPDATE_SUBSCRIBER,
    {
      refetchQueries: [
        'GetSubscribers',
        ['GetSubscriber', { id: subscriberId }],
      ],
    }
  );

  const subscriberFields = subscriber?.data?.fields || [];
  const fields = availableFields?.data || [];

  const initialValues = {
    name: subscriber?.data?.name || '',
    email: subscriber?.data?.email || '',
    fields: {
      ...fields.reduce(
        (acc: any, curr: any) => ({
          ...acc,
          [curr.id]: (
            subscriberFields.find(({ field }: any) => field.id === curr.id) || {
              value: curr.type === 'boolean' ? false : '',
            }
          ).value,
        }),
        {}
      ),
    },
  };

  return (
    <Grid container direction="column" alignItems="center">
      {isLoadingSubscriber || isLoadingFields ? (
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      ) : (
        <Formik
          validationSchema={UpdateSchema}
          initialValues={initialValues}
          onSubmit={async (values, { setErrors }) => {
            try {
              await updateSubscriber(
                {
                  id: subscriberId,
                  data: {
                    ...values,
                    fields: Array.from(
                      Object.entries(values.fields),
                      ([id, value]) => ({ id, value })
                    ),
                  },
                },
                {
                  waitForRefetchQueries: true,
                }
              );

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
            handleSubmit,
            setFieldValue,
          }) => {
            const hasError = (fieldName: string) =>
              errors.hasOwnProperty(fieldName) &&
              touched.hasOwnProperty(fieldName);

            return (
              <Grid container item xs={4} spacing={2} component={Paper}>
                <Grid item xs={12}>
                  <Typography variant="h5">Update Subscriber</Typography>
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
                    disabled={isUpdating}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleSubmit();
                    }}>
                    {isUpdating ? (
                      <CircularProgress style={{ color: 'white' }} size={24} />
                    ) : (
                      'Update'
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

export default Edit;
