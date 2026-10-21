import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Square, Play, Pause, RotateCcw, UploadCloud, 
  Trash2, Volume2, MapPin, User, Phone, Mail, ArrowRight, 
  Info, AlertCircle, CheckCircle2, FileAudio, Sparkles, RefreshCw
} from 'lucide-react';
import SupportingDocumentsDropzone from './SupportingDocumentsDropzone';

const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac'];
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function VoiceComplaintUpload({ formData, onUpdateFormData, onProceedToReview }) {
  // Mode: 'record' (Live Mic) or 'upload' (Audio File)
  const [voiceMode, setVoiceMode] = useState('record');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [speechTranscript, setSpeechTranscript] = useState('');
  
  // General validation & upload errors
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});

  // Refs for MediaRecorder & Timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Sync existing audio from formData if available
  useEffect(() => {
    if (formData.audioFile instanceof File) {
      const url = URL.createObjectURL(formData.audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (formData.audioBlob instanceof Blob) {
      const url = URL.createObjectURL(formData.audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData.audioFile, formData.audioBlob]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // START RECORDING
  const startRecording = async () => {
    setUploadError('');
    audioChunksRef.current = [];
    setRecordingDuration(0);
    setSpeechTranscript('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setUploadError('Microphone recording is not supported in this browser. Please use the Upload Audio option.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `grievance_voice_${Date.now()}.webm`, { type: 'audio/webm' });
        
        onUpdateFormData({ 
          audioFile: file, 
          audioBlob: audioBlob,
          audioDuration: recordingDuration 
        });

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Optional live speech recognition if supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
            }
            setSpeechTranscript(transcript.trim());
            // Prepopulate description if empty
            if (!formData.description) {
              onUpdateFormData({ description: transcript.trim() });
            }
          };

          recognition.onerror = () => {
            // Speech recognition failure shouldn't disrupt audio recording
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {
          // Ignore speech recognition errors
        }
      }

    } catch (err) {
      console.error('Microphone error:', err);
      setUploadError('Microphone access was denied or not found. Please check browser permissions.');
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  // DISCARD / RE-RECORD
  const handleDiscardAudio = () => {
    stopRecording();
    setAudioUrl(null);
    setRecordingDuration(0);
    setSpeechTranscript('');
    onUpdateFormData({ audioFile: null, audioBlob: null, audioDuration: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AUDIO FILE UPLOAD HANDLER
  const handleAudioFileSelection = (file) => {
    setUploadError('');
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isValidExt = ALLOWED_AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const isAudioMime = file.type.startsWith('audio/');

    if (!isValidExt && !isAudioMime) {
      setUploadError('Invalid audio file format. Supported formats: MP3, WAV, M4A, OGG, WEBM.');
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setUploadError(`Audio file exceeds 10MB limit (${formatBytes(file.size)}). Please compress or select a shorter recording.`);
      return;
    }

    onUpdateFormData({ audioFile: file, audioBlob: null });
    if (errors.audio) {
      setErrors((prev) => ({ ...prev, audio: '' }));
    }
  };

  // FORM VALIDATION
  const validate = () => {
    const errs = {};
    const hasAudio = formData.audioFile || formData.audioBlob;

    if (!hasAudio) {
      errs.audio = 'Please record your voice complaint or upload an audio file before proceeding.';
    }
    if (!formData.title?.trim()) {
      errs.title = 'Complaint title / topic is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }
    if (!formData.location?.trim()) {
      errs.location = 'Incident location or landmark is required.';
    }
    if (formData.phone && !/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number or leave blank.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address or leave blank.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onProceedToReview();
    }
  };

  const hasAudioSaved = Boolean(formData.audioFile || formData.audioBlob);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Voice Complaint Architecture Info */}
      <div className="p-3.5 bg-violet-50/70 border border-violet-200/80 rounded-xl flex items-start gap-2.5 text-xs text-violet-950">
        <Volume2 className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Speech-to-Text & Automated NLP Classification</p>
          <p className="leading-relaxed text-violet-900">
            Voice complaints enable effortless filing for all citizens. 
            Your voice recording is transcribed by the Speech-to-Text engine into complaint text, which our NLP model evaluates to route directly to the responsible municipal department.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-violet-700 pt-1">
            <span className="bg-white/80 px-2 py-0.5 rounded border border-violet-200">Voice Note</span>
            <span>&rarr;</span>
            <span className="bg-white/80 px-2 py-0.5 rounded border border-violet-200">Speech-to-Text (ASR)</span>
            <span>&rarr;</span>
            <span className="bg-white/80 px-2 py-0.5 rounded border border-violet-200">NLP Classifier</span>
          </div>
        </div>
      </div>

      {/* Voice Mode Selector: Mic Recording vs File Upload */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <label className="text-xs font-semibold text-slate-700">
          Audio Input Method <span className="text-rose-500">*</span>
        </label>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setVoiceMode('record')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              voiceMode === 'record'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Record Voice</span>
          </button>
          <button
            type="button"
            onClick={() => setVoiceMode('upload')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              voiceMode === 'upload'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Audio File</span>
          </button>
        </div>
      </div>

      {/* VOICE RECORDING SECTION */}
      {voiceMode === 'record' && (
        <div>
          {!hasAudioSaved && !isRecording ? (
            /* Ready to Record Box */
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-7 text-center bg-white hover:border-violet-400 transition-all">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 shadow-xs">
                <Mic className="h-7 w-7 stroke-[1.8]" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 mb-1">
                Speak Your Complaint Directly
              </h3>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-4">
                Click below to start recording. Clearly state your grievance, the location, and how long the issue has persisted.
              </p>
              <button
                type="button"
                onClick={startRecording}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto shadow-md shadow-violet-600/20 transition-all cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording Grievance</span>
              </button>
            </div>
          ) : isRecording ? (
            /* Active Recording In Progress Box */
            <div className="border-2 border-rose-400 bg-rose-50/30 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Recording In Progress
                </span>
              </div>

              {/* Live Timer */}
              <div className="text-3xl font-mono font-bold text-slate-800">
                {formatTimer(recordingDuration)}
              </div>

              {/* Soundwave Simulation Animation */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[40, 75, 55, 90, 60, 100, 70, 45, 85, 65, 95, 50].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-violet-500 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
                  />
                ))}
              </div>

              {/* Live Speech Recognition Draft (if active) */}
              {speechTranscript && (
                <div className="p-3 bg-white/90 rounded-xl border border-rose-200 text-xs text-slate-700 italic max-w-md mx-auto text-left">
                  <span className="text-[10px] font-bold text-violet-600 not-italic block mb-1">Live Speech Preview:</span>
                  "{speechTranscript}"
                </div>
              )}

              {/* Stop & Save Action */}
              <button
                type="button"
                onClick={stopRecording}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Stop & Save Recording</span>
              </button>
            </div>
          ) : (
            /* Audio Recorded Preview Card */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Voice Grievance Recorded
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Ready for Speech-to-Text processing</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Re-record</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAudio}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete recording"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Standard HTML5 Audio Player */}
              {audioUrl && (
                <div className="pt-1">
                  <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AUDIO FILE UPLOAD SECTION */}
      {voiceMode === 'upload' && (
        <div>
          {!hasAudioSaved ? (
            <div
              className="border-2 border-dashed border-slate-200 rounded-2xl p-7 text-center bg-white hover:border-violet-400 transition-all"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="h-6 w-6 stroke-[1.8]" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mb-1">
                Upload your pre-recorded audio file
              </p>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Supports MP3, WAV, M4A, OGG, WEBM up to 10MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.webm,.aac,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAudioFileSelection(e.target.files[0]);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors border border-violet-200 cursor-pointer"
              >
                Browse Audio File
              </button>
            </div>
          ) : (
            /* Uploaded Audio File Card */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {formData.audioFile?.name || 'Uploaded Voice Note'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formData.audioFile?.size ? formatBytes(formData.audioFile.size) : 'Audio attached'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAudio}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {audioUrl && (
                <div className="pt-1">
                  <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audio Error message */}
      {uploadError && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
      {errors.audio && !uploadError && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{errors.audio}</span>
        </p>
      )}

      {/* Complaint Title / Topic */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Complaint Title / Topic <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => {
            onUpdateFormData({ title: e.target.value });
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="Brief topic of the spoken grievance (e.g., Street drainage overflow)"
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Optional Context / Transcript Text */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Written Highlights / Transcription Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {formData.description?.length || 0} / 1000 chars
          </span>
        </div>
        <textarea
          rows={3}
          value={formData.description || ''}
          maxLength={1000}
          onChange={(e) => onUpdateFormData({ description: e.target.value })}
          placeholder="Add any extra notes or landmarks you might have missed in your audio recording..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
        />
      </div>

      {/* Incident Location */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Incident / Problem Location <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => {
              onUpdateFormData({ location: e.target.value });
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            placeholder="Ward number, street name, area, or nearest civic landmark"
            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
              errors.location
                ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
                : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.location && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.location}</span>
          </p>
        )}
      </div>

      {/* Citizen Contact Details */}
      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
        <span className="text-xs font-semibold text-slate-800 block">
          Citizen Contact Details (For SMS & Tracking Updates)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.citizenName || ''}
                onChange={(e) => onUpdateFormData({ citizenName: e.target.value })}
                placeholder="Full name"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => {
                  onUpdateFormData({ phone: e.target.value });
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98765 43210"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  onUpdateFormData({ email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="citizen@example.com"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Supporting Documents (Optional) */}
      <SupportingDocumentsDropzone
        attachments={formData.attachments || []}
        onAttachmentsChange={(files) => onUpdateFormData({ attachments: files })}
      />

      {/* Review Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>Review Submission</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
