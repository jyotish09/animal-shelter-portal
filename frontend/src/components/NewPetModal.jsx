import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Alert,
  Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useCreatePet } from '../hooks/useCreatePet';

function normalizeText(v) {
  return String(v ?? '').trim().replace(/\s+/g, ' ');
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function NewPetModal({ open, onClose }) {
  const mutation = useCreatePet();
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const defaultValues = useMemo(
    () => ({
      name: '',
      breed: '',
      ageYears: '',
      imageUrl: ''
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    defaultValues,
    mode: 'onSubmit'
  });

  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      setSelectedFile(null);
      setSuccessMessage('');
      mutation.reset?.();
    }
  }, [open, reset, defaultValues]);

  function validateImageChoice(values) {
    const hasFile = Boolean(selectedFile);
    const hasUrl = Boolean(normalizeText(values.imageUrl));

    if (hasFile && hasUrl) {
      setError('imageUrl', {
        type: 'manual',
        message: 'Choose either image upload or image URL, not both.'
      });
      return false;
    }

    if (!hasFile && !hasUrl) {
      setError('imageUrl', {
        type: 'manual',
        message: 'Provide either an image upload or an image URL.'
      });
      return false;
    }

    if (hasUrl && !isHttpUrl(values.imageUrl)) {
      setError('imageUrl', {
        type: 'manual',
        message: 'Image URL must start with http:// or https://'
      });
      return false;
    }

    clearErrors('imageUrl');
    return true;
  }

  async function onSubmit(values) {
    setSuccessMessage('');

    if (!validateImageChoice(values)) return;

    const formData = new FormData();
    formData.append('name', normalizeText(values.name));
    formData.append('breed', normalizeText(values.breed));
    formData.append('ageYears', String(values.ageYears).trim());

    if (selectedFile) {
      formData.append('imageFile', selectedFile);
    } else {
      formData.append('imageUrl', normalizeText(values.imageUrl));
    }

    try {
      await mutation.mutateAsync(formData);
      setSuccessMessage('Pet created successfully.');
      reset(defaultValues);
      setSelectedFile(null);
    } catch {
      // mutation error already shown below
    }
  }

  const disabled = mutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
        Add New Pet
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
          {mutation.isError ? (
            <Alert severity="error">
              {mutation.error?.message || 'Failed to create pet.'}
            </Alert>
          ) : null}

          <TextField
            disabled={disabled}
            label="Dog name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'Required',
              minLength: { value: 1, message: 'Required' },
              maxLength: { value: 80, message: 'Max 80 characters' }
            })}
          />

          <TextField
            disabled={disabled}
            label="Breed"
            error={Boolean(errors.breed)}
            helperText={errors.breed?.message}
            {...register('breed', {
              required: 'Required',
              minLength: { value: 1, message: 'Required' },
              maxLength: { value: 80, message: 'Max 80 characters' }
            })}
          />

          <TextField
            disabled={disabled}
            label="Age (years)"
            type="number"
            inputProps={{ min: 0, max: 30, step: 1 }}
            error={Boolean(errors.ageYears)}
            helperText={errors.ageYears?.message}
            {...register('ageYears', {
              required: 'Required',
              validate: (value) => {
                const n = Number(value);
                if (!Number.isInteger(n)) return 'Must be a whole number';
                if (n < 0 || n > 30) return 'Must be between 0 and 30';
                return true;
              }
            })}
          />

          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 800 }}>Image upload</Typography>
            <Button
              component="label"
              variant="outlined"
              disabled={disabled || Boolean(normalizeText(imageUrlValue))}
              sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 900 }}
            >
              Choose image file
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  clearErrors('imageUrl');
                }}
              />
            </Button>

            {selectedFile ? (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Optional if using image URL instead.
              </Typography>
            )}
          </Stack>

          <TextField
            disabled={disabled || Boolean(selectedFile)}
            label="Image URL"
            placeholder="https://example.com/dog.jpg"
            error={Boolean(errors.imageUrl)}
            helperText={errors.imageUrl?.message || 'Use this only if not uploading a file.'}
            {...register('imageUrl')}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 999, fontWeight: 900 }}
        >
          Close
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={disabled}
          sx={{ borderRadius: 999, fontWeight: 900 }}
        >
          {mutation.isPending ? 'Creating…' : 'Create pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}