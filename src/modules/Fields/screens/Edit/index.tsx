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
import { GET_FIELD, GET_FIELD_TYPES } from '../../../../api/queries';
import { useHistory, useParams } from 'react-router-dom';
import { UPDATE_FIELD } from '../../../../api/mutations';
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

const Edit = () => {
  const { fieldId } = useParams();
  const history = useHistory();
  const showSuccess = useShowSuccess();
  const showError = useShowError();

  const {
    data: loadedFieldTypes,
    isLoading: isLoadingFieldTypes,
  } = useAuthQuery('GetFieldTypes', GET_FIELD_TYPES);

  const { data: field, isLoading: isLoadingField } = useAuthQuery(
    ['GetField', { id: fieldId }],
    GET_FIELD
  );

  const [updateField, { isLoading: isUpdating }] = useAuthMutation(
    UPDATE_FIELD,
    {
      refetchQueries: ['GetFields', ['GetField', { id: fieldId }]],
    }
  );

  const fieldTypes = loadedFieldTypes?.data || [];

  const initialValues = {
    name: field?.data?.name || '',
    type: field?.data?.type || '',
  };

  return (
    <Grid container direction="column" alignItems="center">
      {isLoadingFieldTypes || isLoadingField ? (
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      ) : (
        <Formik
          validationSchema={CreateSchema}
          initialValues={initialValues}
          onSubmit={async ({ name }, { setErrors }) => {
            try {
              await updateField(
                {
                  id: fieldId,
                  data: {
                    name,
                  },
                },
                {
                  waitForRefetchQueries: true,
                }
              );

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
                  <Typography variant="h5">Update Field</Typography>
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
                      disabled={true}
                      value={values.type}
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
