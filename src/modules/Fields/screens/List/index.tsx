import React, { useState } from 'react';
import {
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  TablePagination,
  IconButton,
  Button,
} from '@material-ui/core';
import {
  RemoveCircleOutline,
  EditOutlined,
  AddOutlined,
} from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import withDeleteConfirmationDialog from '../../../../hoc/withDeleteConfirmationDialog';
import { GET_FIELDS } from '../../../../api/queries';
import { DELETE_FIELD } from '../../../../api/mutations';
import { formatDistanceToNow } from 'date-fns';
import { useAuthQuery } from '../../../../hooks';

const List = ({ openDeleteConfirmationDialog }: any) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const {
    data: fields,
    isLoading,
    isFetching,
  } = useAuthQuery(
    ['GetFields', { limit: rowsPerPage, page: page + 1 }],
    GET_FIELDS
  );

  return (
    <Grid container spacing={2} direction="column">
      <Grid container item lg={12} justify="flex-end">
        <Button
          variant="outlined"
          color="primary"
          component={RouterLink}
          to="/fields/create"
          startIcon={<AddOutlined />}>
          Add Field
        </Button>
      </Grid>
      <Grid container item lg={12} justify="center">
        {isLoading || isFetching ? (
          <CircularProgress />
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Type</TableCell>
                    <TableCell align="left">Created At</TableCell>
                    <TableCell align="left">Updated At</TableCell>
                    <TableCell align="left">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(fields?.data || []).map((row: any) => (
                    <TableRow hover key={row.id}>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">{row.type}</TableCell>
                      <TableCell align="left">
                        {formatDistanceToNow(new Date(row.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell align="left">
                        {formatDistanceToNow(new Date(row.updated_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell align="left">
                        <IconButton
                          edge="start"
                          component={RouterLink}
                          to={`/fields/${row.id}/edit`}
                          aria-label="edit">
                          <EditOutlined color="primary" />
                        </IconButton>
                        <IconButton
                          edge="start"
                          aria-label="remove"
                          onClick={() => {
                            openDeleteConfirmationDialog(row.id);
                          }}>
                          <RemoveCircleOutline color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={fields?.meta?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={(event, newPage) => {
                setPage(newPage);
              }}
              onChangeRowsPerPage={event => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default withDeleteConfirmationDialog(
  List,
  'Delete Field',
  'Are you sure you want to delete this field ?',
  DELETE_FIELD,
  ['GetFields']
);
