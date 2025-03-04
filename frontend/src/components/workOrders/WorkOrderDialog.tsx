import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Grid, CircularProgress,
  FormHelperText
} from '@mui/material';
import { WorkOrder, WorkOrderRequest } from '../../types/workOrder';
import { User } from '../../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field, FieldProps, FormikHelpers } from 'formik';

interface WorkOrderDialogProps {
  open: boolean;
  workOrder: WorkOrder | null;
  users?: User[];
  loading?: boolean;
  onClose: () => void;
  onSave: (workOrder: WorkOrderRequest) => void;
}

const initialValues: WorkOrderRequest = {
  woNumber: '',
  workType: '',
  client: '',
  photoCount: 0,
  state: '',
  clientDueDate: new Date().toISOString().split('T')[0],
  updater: '',
  orderStatus: 'Submitted',
  remarkCategory: '',
  isRush: false,
  userId: undefined
};

// Validation function for Formik
const validateWorkOrder = (values: WorkOrderRequest) => {
  const errors: Partial<Record<keyof WorkOrderRequest, string>> = {};
  
  if (!values.woNumber) {
    errors.woNumber = 'Work Order Number is required';
  }
  
  if (!values.workType) {
    errors.workType = 'Work Type is required';
  }
  
  if (!values.client) {
    errors.client = 'Client is required';
  }
  
  if (values.photoCount !== undefined && values.photoCount < 0) {
    errors.photoCount = 'Photo count must be positive';
  }
  
  if (!values.clientDueDate) {
    errors.clientDueDate = 'Due date is required';
  }
  
  if (!values.orderStatus) {
    errors.orderStatus = 'Status is required';
  }
  
  return errors;
};

const WorkOrderDialog: React.FC<WorkOrderDialogProps> = ({
  open,
  workOrder,
  users = [],
  loading = false,
  onClose,
  onSave
}) => {
  const handleSubmit = (values: WorkOrderRequest, { setSubmitting }: FormikHelpers<WorkOrderRequest>) => {
    onSave(values);
    setSubmitting(false);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{workOrder ? 'Edit Work Order' : 'Create Work Order'}</DialogTitle>
      <Formik
        initialValues={workOrder ? {
          woNumber: workOrder.woNumber,
          workType: workOrder.workType,
          client: workOrder.client,
          photoCount: workOrder.photoCount || 0,
          state: workOrder.state || '',
          clientDueDate: workOrder.clientDueDate,
          updater: workOrder.updater || '',
          orderStatus: workOrder.orderStatus,
          remarkCategory: workOrder.remarkCategory || '',
          startTime: workOrder.startTime,
          endTime: workOrder.endTime,
          numberOfBids: workOrder.numberOfBids,
          bidAmount: workOrder.bidAmount,
          isRush: workOrder.isRush,
          userId: workOrder.user?.id
        } : initialValues}
        validate={validateWorkOrder}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Field name="woNumber">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Work Order Number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="workType">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Work Type"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="client">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Client"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="photoCount">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Photo Count"
                        type="number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.state && Boolean(errors.state)}>
                    <InputLabel>State</InputLabel>
                    <Field
                      name="state"
                      as={Select}
                      label="State"
                      disabled={loading}
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="TN">TN</MenuItem>
                      <MenuItem value="LA">LA</MenuItem>
                      <MenuItem value="SC">SC</MenuItem>
                      <MenuItem value="NC">NC</MenuItem>
                      <MenuItem value="IL">IL</MenuItem>
                      <MenuItem value="TX">TX</MenuItem>
                      <MenuItem value="NY">NY</MenuItem>
                      <MenuItem value="WV">WV</MenuItem>
                    </Field>
                    {touched.state && errors.state && (
                      <FormHelperText>{errors.state}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Client Due Date"
                      value={new Date(values.clientDueDate)}
                      onChange={(date) => {
                        if (date) {
                          setFieldValue('clientDueDate', date.toISOString().split('T')[0]);
                        }
                      }}
                      disabled={loading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: touched.clientDueDate && Boolean(errors.clientDueDate),
                          helperText: touched.clientDueDate && errors.clientDueDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="updater">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Updater"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={touched.orderStatus && Boolean(errors.orderStatus)}>
                    <InputLabel>Order Status</InputLabel>
                    <Field
                      name="orderStatus"
                      as={Select}
                      label="Order Status"
                      disabled={loading}
                    >
                      <MenuItem value="Submitted">Submitted</MenuItem>
                      <MenuItem value="RTV Fixed">RTV Fixed</MenuItem>
                      <MenuItem value="QC Done">QC Done</MenuItem>
                      <MenuItem value="Saved">Saved</MenuItem>
                      <MenuItem value="Follow Up">Follow Up</MenuItem>
                    </Field>
                    {touched.orderStatus && errors.orderStatus && (
                      <FormHelperText>{errors.orderStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="remarkCategory">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Remark/Category"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="numberOfBids">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Number of Bids"
                        type="number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="bidAmount">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bid Amount"
                        type="number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.userId && Boolean(errors.userId)}>
                    <InputLabel>Assigned User</InputLabel>
                    <Field
                      name="userId"
                      as={Select}
                      label="Assigned User"
                      disabled={loading}
                    >
                      <MenuItem value="">None</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.userId && errors.userId && (
                      <FormHelperText>{errors.userId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Field
                        name="isRush"
                        as={Checkbox}
                        checked={values.isRush}
                        disabled={loading}
                      />
                    }
                    label="Rush Order"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={loading || isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default WorkOrderDialog;
