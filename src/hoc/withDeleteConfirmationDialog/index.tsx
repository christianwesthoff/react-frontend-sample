import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from '@material-ui/core';
import { useAuthMutation, useShowError, useShowSuccess } from '../../hooks';

const withDeleteConfirmationDialog = (
  ComposedComponent: any,
  title: string,
  message: string,
  deleteMutation: any,
  refetchQueries: Array<string>
) => (props: any) => {
  const showError = useShowError();
  const showSuccess = useShowSuccess();

  const [open, setOpen] = useState(false);

  const [deleteItem, { isLoading }] = useAuthMutation(deleteMutation, {
    refetchQueries,
  });

  const [deletedItem, setDeletedItem] = useState(0);

  const handleClose = useCallback(() => {
    setDeletedItem(0);
    setOpen(false);
  }, []);

  const handleOpen = useCallback(deletedItem => {
    setDeletedItem(deletedItem);
    setOpen(true);
  }, []);

  return (
    <>
      <ComposedComponent {...props} openDeleteConfirmationDialog={handleOpen} />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isLoading} onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await deleteItem({
                  id: deletedItem,
                });

                showSuccess();
                handleClose();
              } catch (e) {
                showError();
              }
            }}
            disabled={isLoading}
            color="primary"
            autoFocus>
            {isLoading ? <CircularProgress size={14} /> : 'Ok'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withDeleteConfirmationDialog;
