'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import paymentService from '../../services/payments/paymentService';

interface ReceiptUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentFile?: File | null;
  currentReceiptUrl?: string;
  disabled?: boolean;
  error?: string;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onFileSelect,
  onFileRemove,
  currentFile,
  currentReceiptUrl,
  disabled = false,
  error,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Validate file
        const validation = paymentService.validateReceiptFile(file);
        if (!validation.valid) {
          setValidationError(validation.error || 'Invalid file');
          return;
        }
        
        setValidationError(null);
        onFileSelect(file);
        
        // Create preview for images
        const previewUrl = paymentService.createReceiptPreview(file);
        if (previewUrl) {
          setPreview(previewUrl);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setValidationError(null);
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const displayError = error || validationError;

  return (
    <>
      <Box>
        {!currentFile && !currentReceiptUrl ? (
          <Paper
            {...getRootProps()}
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: disabled ? 'grey.300' : 'primary.main',
                bgcolor: disabled ? 'background.paper' : 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: isDragActive ? 'primary.main' : 'text.secondary',
                }}
              />
              <Typography variant="body1" align="center">
                {isDragActive
                  ? 'Drop the receipt here'
                  : 'Drag & drop a receipt here, or click to select'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports JPG, PNG, PDF (max 5MB)
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              {currentFile ? (
                <>
                  {preview ? (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={preview}
                        alt="Receipt preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  ) : (
                    <FileIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  )}
                  <Box flex={1}>
                    <Typography variant="body2" noWrap>
                      {currentFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </>
              ) : currentReceiptUrl ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box flex={1}>
                    <Typography variant="body2">Receipt uploaded</Typography>
                    <Chip
                      label="View Receipt"
                      size="small"
                      onClick={handlePreview}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </>
              ) : null}
              
              <Box display="flex" gap={1}>
                {(preview || currentReceiptUrl) && (
                  <IconButton
                    size="small"
                    onClick={handlePreview}
                    disabled={disabled}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={handleRemove}
                  disabled={disabled}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}
        
        {displayError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {displayError}
          </Alert>
        )}
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Receipt Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {preview && currentFile?.type.startsWith('image/') ? (
            <Box
              sx={{
                width: '100%',
                height: 400,
                position: 'relative',
              }}
            >
              <Image
                src={preview}
                alt="Receipt"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          ) : currentReceiptUrl ? (
            <Box
              sx={{
                width: '100%',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentReceiptUrl.endsWith('.pdf') ? (
                <Typography>PDF receipt - Download to view</Typography>
              ) : (
                <Image
                  src={currentReceiptUrl}
                  alt="Receipt"
                  width={400}
                  height={400}
                  style={{ objectFit: 'contain' }}
                />
              )}
            </Box>
          ) : (
            <Typography>Preview not available</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptUpload;