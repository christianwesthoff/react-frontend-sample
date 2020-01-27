import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {useMst, useShowError, useShowSuccess} from '../../../../hooks';

const Callback = () => {
  const history = useHistory();
  const showError = useShowError();
  const showSuccess = useShowSuccess();
  const { auth } = useMst();

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await auth.getCredentials();
  //       showSuccess('Welcome to App !');
  //       history.push('/subscribers');
  //     } catch {
  //       showError('Could not log you in, please try again.');
  //       history.push('/login');
  //     }
  //   })();
  // }, []);

  return null;
};

export default Callback;
