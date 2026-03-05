import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Skeleton,
  Snackbar,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useAdminApplications } from '../hooks/useAdminApplications';
import { useApproveApplication } from '../hooks/useApproveApplication';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import { usePetsByIds } from '../hooks/usePetsByIds';
import NewPetModal from '../components/NewPetModal';

const STATUS_ALL = 'ALL';

function statusChipProps(status) {
  if (status === 'SUBMITTED') {
    return {
      label: 'Submitted',
      sx: {
        bgcolor: 'rgba(245,158,11,0.12)',
        color: '#92400E',
        borderColor: 'rgba(245,158,11,0.25)'
      }
    };
  }
  if (status === 'APPROVED') {
    return {
      label: 'Approved',
      sx: {
        bgcolor: 'rgba(34,197,94,0.12)',
        color: '#166534',
        borderColor: 'rgba(34,197,94,0.25)'
      }
    };
  }
  return {
    label: 'Invalidated',
    sx: {
      bgcolor: 'rgba(15,23,42,0.10)',
      color: '#0F172A',
      borderColor: 'rgba(15,23,42,0.20)'
    }
  };
}

export default function AdminPage() {
  const { t } = useTranslation();

  const [status, setStatus] = useState(STATUS_ALL);

  // raw input
  const [petNameInput, setPetNameInput] = useState('');

  // debounced query sent to backend
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;

  const [toast, setToast] = useState({ open: false, message: '' });

  // Row modal state
  const [selected, setSelected] = useState(null);

  // 2-step confirm state
  const [confirmId, setConfirmId] = useState(null);

  const statusParam = status === STATUS_ALL ? undefined : status;
  const searchParam = searchQuery.trim() ? searchQuery.trim() : undefined;

  // New pet modal state
  const [isNewPetOpen, setIsNewPetOpen] = useState(false);

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value) => {
        setPage(1);
        setSearchQuery(value.trim());
      }, 350),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const appsQuery = useAdminApplications({
    status: statusParam,
    search: searchParam,
    page,
    limit
  });

  const approveMutation = useApproveApplication();

  const rows = appsQuery.data?.data || [];
  const meta = appsQuery.data?.meta;

  // keep this only for display enrichment
  const petIds = useMemo(() => rows.map((r) => r.petId), [rows]);
  const { petMap } = usePetsByIds(petIds);

  const emptyState = !appsQuery.isLoading && rows.length === 0;
  const canApprove = (row) => row.status === 'SUBMITTED';

  async function approve(applicationId) {
    try {
      await approveMutation.mutateAsync(applicationId);
      setToast({ open: true, message: 'Application approved. Pet adopted.' });
      setConfirmId(null);
    } catch (e) {
      setToast({ open: true, message: e?.message || 'Approve failed.' });
    }
  }

  function onApproveClick(e, row) {
    e.stopPropagation();
    if (!canApprove(row) || approveMutation.isPending) return;

    if (confirmId === row.id) approve(row.id);
    else setConfirmId(row.id);
  }

  function onCancelConfirm(e) {
    e.stopPropagation();
    setConfirmId(null);
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={0.75}>
          <Typography variant="h5" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
            Admin • Applications
          </Typography>
          <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
            No authentication in this demo. Approving one application adopts the pet and invalidates the rest.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewPetOpen(true)}
            sx={{ borderRadius: 999, fontWeight: 900 }}
          >
            New Pet
          </Button>
        </Stack>

        {/* Filters */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ mt: 2.5, alignItems: { md: 'center' } }}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                setConfirmId(null);
              }}
              displayEmpty
            >
              <MenuItem value={STATUS_ALL}>All statuses</MenuItem>
              <MenuItem value="SUBMITTED">Submitted</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="INVALIDATED">Invalidated</MenuItem>
            </Select>
          </FormControl>

          <TextField
            value={petNameInput}
            onChange={(e) => {
              const value = e.target.value;
              setPetNameInput(value);
              setConfirmId(null);
              debouncedSetSearchQuery(value);
            }}
            label="Pet name"
            placeholder="e.g., Lola"
            fullWidth
          />

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setStatus(STATUS_ALL);
              setPetNameInput('');
              setSearchQuery('');
              debouncedSetSearchQuery.cancel();
              setPage(1);
              setConfirmId(null);
            }}
          >
            Clear filters
          </Button>
        </Stack>

        {appsQuery.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {appsQuery.error?.message || t('common.error')}
          </Alert>
        ) : null}

        {!appsQuery.isLoading && rows.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No applications found for the current filters.
          </Alert>
        ) : null}

        <Box sx={{ mt: 2 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Pet</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Created</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {appsQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={90} /></TableCell>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={170} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell align="right"><Skeleton width={120} /></TableCell>
                      </TableRow>
                    ))
                  : rows.map((row) => {
                      const chip = statusChipProps(row.status);
                      const isConfirming = confirmId === row.id;
                      const isRowApproving =
                        approveMutation.isPending && approveMutation.variables === row.id;

                      const petNameLabel = petMap[row.petId]?.name || '—';

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelected(row);
                            setConfirmId(null);
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={chip.label}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 900, ...chip.sx }}
                            />
                          </TableCell>

                          <TableCell sx={{ fontWeight: 800 }}>{row.applicantName}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{row.contact}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>{petNameLabel}</TableCell>
                          <TableCell>{row.createdAt}</TableCell>

                          <TableCell align="right">
                            {canApprove(row) ? (
                              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  color={isConfirming ? 'info' : 'primary'}
                                  startIcon={isConfirming ? <DoneIcon /> : <CheckCircleIcon />}
                                  disabled={approveMutation.isPending}
                                  onClick={(e) => onApproveClick(e, row)}
                                  sx={{
                                    borderRadius: 999,
                                    fontWeight: 900,
                                    transition: 'all 160ms ease',
                                    transform: isConfirming ? 'scale(1.02)' : 'none'
                                  }}
                                >
                                  {isRowApproving ? 'Approving…' : isConfirming ? 'Confirm' : 'Approve'}
                                </Button>

                                {isConfirming ? (
                                  <IconButton
                                    size="small"
                                    onClick={onCancelConfirm}
                                    aria-label="Cancel approve"
                                    sx={{
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      bgcolor: 'background.paper'
                                    }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                ) : null}
                              </Stack>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                sx={{ borderRadius: 999, fontWeight: 900 }}
                              >
                                {row.status === 'APPROVED' ? 'Approved' : 'N/A'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>

          {meta?.totalPages && meta.totalPages > 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, p) => {
                  setPage(p);
                  setConfirmId(null);
                }}
                color="primary"
                shape="rounded"
              />
            </Box>
          ) : null}
        </Box>
      </Paper>

      <ApplicationDetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        application={selected}
      />

      <NewPetModal
        open={isNewPetOpen}
        onClose={() => setIsNewPetOpen(false)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        message={toast.message}
      />
    </Box>
  );
}
