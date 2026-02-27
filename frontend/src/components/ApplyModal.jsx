import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useApplyForAdoption } from '../hooks/useApplyForAdoption';

/**
 * ApplyModal
 * - Client-side validation (stricter):
 *   - applicantName: letters/spaces .'- only
 *   - contact: email OR AU mobile
 *   - reason: 10..1000 chars, no < >
 * - Submits via React Query mutation
 * - After success: disables submit button (and inputs)
 * - If backend returns validation errors, maps them to fields when possible
 */

function normalizeText(v) {
  return String(v ?? '').trim().replace(/\s+/g, ' ');
}

function isLikelyEmail(v) {
  const s = normalizeText(v);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isAuMobile(v) {
  const s = normalizeText(v).replace(/\s+/g, '');
  return /^(?:\+?61|0)4\d{8}$/.test(s);
}

function validateContact(v) {
  return isLikelyEmail(v) || isAuMobile(v) || 'Enter a valid email or AU mobile number.';
}

function validateName(v) {
  const s = normalizeText(v);
  const ok = /^[\p{L}][\p{L}\p{M}\s.'-]*$/u.test(s);
  return ok || "Name can only contain letters, spaces, and . ' -";
}

function validateReason(v) {
  const s = normalizeText(v);
  if (/[<>]/.test(s)) return 'Please remove < or > characters.';
  return true;
}

export default function ApplyModal({ open, onClose, pet }) {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const mutation = useApplyForAdoption();

  const defaultValues = useMemo(() => ({ applicantName: '', contact: '', reason: '' }), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm({
    defaultValues,
    mode: 'onSubmit'
  });

  useEffect(() => {
    if (!open) {
      setSuccess(false);
      mutation.reset?.();
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  async function onSubmit(values) {
    setSuccess(false);

    try {
      await mutation.mutateAsync({
        petId: pet.id,
        payload: {
          applicantName: normalizeText(values.applicantName),
          contact: normalizeText(values.contact),
          reason: normalizeText(values.reason)
        }
      });

      setSuccess(true);
    } catch (err) {
      const fieldErrors = err?.payload?.error?.details?.fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (Array.isArray(messages) && messages.length) {
            setError(field, { type: 'server', message: String(messages[0]) });
          }
        }
      }
      throw err;
    }
  }

  const disabled = mutation.isPending || success;

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
            disabled={disabled}
            label={t('home.modal.name')}
            error={Boolean(errors.applicantName)}
            helperText={errors.applicantName?.message}
            {...register('applicantName', {
              required: 'Required',
              minLength: { value: 2, message: 'Min 2 characters' },
              maxLength: { value: 80, message: 'Max 80 characters' },
              validate: validateName
            })}
          />

          <TextField
            disabled={disabled}
            label={t('home.modal.contact')}
            error={Boolean(errors.contact)}
            helperText={errors.contact?.message}
            {...register('contact', {
              required: 'Required',
              minLength: { value: 5, message: 'Min 5 characters' },
              maxLength: { value: 200, message: 'Max 200 characters' },
              validate: validateContact
            })}
          />

          <TextField
            disabled={disabled}
            label={t('home.modal.reason')}
            multiline
            minRows={3}
            error={Boolean(errors.reason)}
            helperText={errors.reason?.message}
            {...register('reason', {
              required: 'Required',
              minLength: { value: 10, message: 'Min 10 characters' },
              maxLength: { value: 1000, message: 'Max 1000 characters' },
              validate: validateReason
            })}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 999, fontWeight: 800 }}>
          {t('home.modal.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={disabled}
          sx={{ borderRadius: 999, fontWeight: 900 }}
        >
          {t('home.modal.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
