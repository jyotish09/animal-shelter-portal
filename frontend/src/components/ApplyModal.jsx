import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useApplyForAdoption } from '../hooks/useApplyForAdoption';

export default function ApplyModal({ open, onClose, pet }) {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const mutation = useApplyForAdoption();

  const defaultValues = useMemo(() => ({ applicantName: '', contact: '', reason: '' }), []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues });

  useEffect(() => {
    if (!open) {
      setSuccess(false);
      mutation.reset?.();
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  async function onSubmit(values) {
    setSuccess(false);
    await mutation.mutateAsync({ petId: pet.id, payload: values });
    setSuccess(true);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
        {t('home.modal.title')} • {pet?.name}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {success ? <Alert severity="success">{t('home.modal.success')}</Alert> : null}
          {mutation.isError ? <Alert severity="error">{mutation.error?.message || t('common.error')}</Alert> : null}

          <TextField
            label={t('home.modal.name')}
            error={Boolean(errors.applicantName)}
            helperText={errors.applicantName?.message}
            {...register('applicantName', { required: 'Required', minLength: { value: 2, message: 'Min 2 characters' }, maxLength: { value: 80, message: 'Max 80 characters' } })}
          />
          <TextField
            label={t('home.modal.contact')}
            error={Boolean(errors.contact)}
            helperText={errors.contact?.message}
            {...register('contact', { required: 'Required', minLength: { value: 3, message: 'Min 3 characters' }, maxLength: { value: 200, message: 'Max 200 characters' } })}
          />
          <TextField
            label={t('home.modal.reason')}
            multiline
            minRows={3}
            error={Boolean(errors.reason)}
            helperText={errors.reason?.message}
            {...register('reason', { required: 'Required', minLength: { value: 10, message: 'Min 10 characters' }, maxLength: { value: 1000, message: 'Max 1000 characters' } })}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 999, fontWeight: 800 }}>
          {t('home.modal.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={mutation.isPending} sx={{ borderRadius: 999, fontWeight: 900 }}>
          {t('home.modal.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
