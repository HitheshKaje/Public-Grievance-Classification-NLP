import React, { useRef, useState } from 'react';
import { Paperclip, Upload, X, FileText, Image as ImageIcon, File, AlertCircle } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'txt'];
const DISALLOWED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'msi', 'js', 'py', 'vbs', 'com'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function SupportingDocumentsDropzone({ attachments = [], onAttachmentsChange }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const validateAndAddFiles = (fileList) => {
    setErrorMessage('');
    const newAttachments = [...attachments];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = file.name.split('.').pop().toLowerCase();

      // Block executables
      if (DISALLOWED_EXTENSIONS.includes(extension)) {
        setErrorMessage(`Security Warning: Executable files (.${extension}) are strictly prohibited.`);
        return;
      }

      // Check allowlist
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setErrorMessage(`Unsupported format (.${extension}). Allowed formats: PDF, JPG, PNG, DOCX, TXT.`);
        return;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File "${file.name}" exceeds the maximum ${MAX_FILE_SIZE_MB}MB size limit.`);
        return;
      }

      // Check duplicate
      const isDuplicate = newAttachments.some(a => a.name === file.name && a.size === file.size);
      if (!isDuplicate) {
        newAttachments.push(file);
      }
    }

    onAttachmentsChange(newAttachments);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeAttachment = (indexToRemove) => {
    const updated = attachments.filter((_, idx) => idx !== indexToRemove);
    onAttachmentsChange(updated);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return <ImageIcon className="h-4 w-4 text-emerald-600" />;
    } else if (ext === 'pdf') {
      return <FileText className="h-4 w-4 text-rose-600" />;
    }
    return <File className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5 text-slate-500" />
          <span>Supporting Documents (Optional)</span>
        </label>
        <span className="text-[11px] text-slate-400">PDF, JPG, PNG, DOCX up to {MAX_FILE_SIZE_MB}MB</span>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="h-8 w-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-xs">
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            <span className="text-blue-600 font-semibold hover:underline">Click to browse</span> or drag and drop files here
          </p>
          <p className="text-[10px] text-slate-400">
            Receipts, past letters, photos, or official notices
          </p>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Attached files list */}
      {attachments.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {attachments.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 bg-white shadow-xs text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div className="p-1 rounded bg-slate-100 flex-shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <div className="truncate">
                  <span className="font-medium text-slate-800 truncate block">{file.name}</span>
                  <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(idx);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                title="Remove attachment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
