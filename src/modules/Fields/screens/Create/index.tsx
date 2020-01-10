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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@material-ui/core';
import { GET_FIELD_TYPES } from '../../../../api/queries';
import { useHistory } from 'react-router-dom';
import { CREATE_FIELD } from '../../../../api/mutations';
import {
  useAuthMutation,
  useAuthQuery,
  useShowError,
  useShowSuccess,
} from '../../../../hooks';

const CreateSchema = Yup.object().shape({
  type: Yup.string().required('Please select a type'),
  name: Yup.string().required('Please provide a name'),
});

const Create = () => {
  const history = useHistory();
  const showSuccess = useShowSuccess();
  const showError = useShowError();

  const { data, isLoading } = useAuthQuery('GetFieldTypes', GET_FIELD_TYPES);

  const [createField, { isLoading: isCreating }] = useAuthMutation(
    CREATE_FIELD,
    {
      refetchQueries: ['GetFields'],
    }
  );

  const fieldTypes = data?.data || [];

  const initialValues = {
    name: '',
    type: '',
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
              await createField({
                data: values,
              });

              showSuccess();
              history.push('/fields');
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
          }) => {
            const hasError = (fieldName: string) =>
              errors.hasOwnProperty(fieldName) &&
              touched.hasOwnProperty(fieldName);

            return (
              <Grid container item xs={4} spacing={2} component={Paper}>
                <Grid item xs={12}>
                  <Typography variant="h5">New Field</Typography>
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
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                      labelId="type-label"
                      value={values.type}
                      error={hasError('type')}
                      onBlur={handleBlur('type')}
                      onChange={handleChange('type')}
                      labelWidth={50}>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {fieldTypes.map(({ name, display_name }: any) => (
                        <MenuItem key={name} value={name}>
                          {display_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {hasError('type') ? (
                      <FormHelperText error>{errors.type}</FormHelperText>
                    ) : null}
                  </FormControl>
                </Grid>
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
