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
  
  // Real-time Mic Level & Diagnostics
  const [micLevel, setMicLevel] = useState(0);
  const [isMicSilent, setIsMicSilent] = useState(false);
  const [waveBars, setWaveBars] = useState([10, 15, 10, 20, 15, 10, 25, 15, 10, 20, 15, 10]);
  const [volumeBoost, setVolumeBoost] = useState(1); // 1 = 1x, 1.5 = 1.5x, 2 = 2x, 3 = 3x
  
  // General validation & upload errors
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});

  // Refs for MediaRecorder & Timer & Web Audio
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const durationRef = useRef(0);
  const fileInputRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // Web Audio Refs for live analysis & boost
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const audioElRef = useRef(null);
  const playbackCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const currentUrlRef = useRef(null);

  // Sync existing audio from formData if available safely
  useEffect(() => {
    let newUrl = null;
    const source = formData.audioFile || formData.audioBlob;
    if (source instanceof File || source instanceof Blob) {
      newUrl = URL.createObjectURL(source);
      setAudioUrl(newUrl);
      currentUrlRef.current = newUrl;
    }
    return () => {
      if (newUrl) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [formData.audioFile, formData.audioBlob]);

  // Clean up timer & audio contexts on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (playbackCtxRef.current && playbackCtxRef.current.state !== 'closed') {
        playbackCtxRef.current.close().catch(() => {});
      }
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Speaker Diagnostic Test Tone (Verify device volume & speakers work)
  const testSpeakerTone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.warn('Speaker test error:', e);
    }
  };

  // Playback Volume Booster using Web Audio Gain Node
  const setGainBoost = (multiplier) => {
    setVolumeBoost(multiplier);
    if (!audioElRef.current) return;
    try {
      if (!playbackCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const pCtx = new AudioCtx();
        playbackCtxRef.current = pCtx;
        const gain = pCtx.createGain();
        gainNodeRef.current = gain;
        const src = pCtx.createMediaElementSource(audioElRef.current);
        sourceNodeRef.current = src;
        src.connect(gain);
        gain.connect(pCtx.destination);
      }
      if (playbackCtxRef.current.state === 'suspended') {
        playbackCtxRef.current.resume();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = multiplier;
      }
    } catch (e) {
      console.warn('Audio booster notice:', e);
    }
  };

  // START RECORDING
  const startRecording = async () => {
    setUploadError('');
    audioChunksRef.current = [];
    setRecordingDuration(0);
    durationRef.current = 0;
    setSpeechTranscript('');
    setIsMicSilent(false);
    setMicLevel(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setUploadError('Microphone recording is not supported in this browser. Please use the Upload Audio option.');
        return;
      }

      // Native audio constraints without sampleRate/channelCount locks (avoids Windows Realtek 48kHz driver conflict)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: false // prevents aggressive noise gating from silencing quiet speech
        }
      });
      streamRef.current = stream;

      // Setup Live AudioContext for real-time VU meter
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const aCtx = new AudioCtx();
        if (aCtx.state === 'suspended') {
          await aCtx.resume();
        }
        audioContextRef.current = aCtx;
        const source = aCtx.createMediaStreamSource(stream);
        const analyser = aCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserRef.current = analyser;

        const timeData = new Uint8Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        let lowVolumeTicks = 0;

        const updateMeter = () => {
          if (!analyserRef.current) return;
          
          // Time domain is much more accurate for voice volume than small FFT bins
          analyserRef.current.getByteTimeDomainData(timeData);
          analyserRef.current.getByteFrequencyData(freqData);

          let maxDev = 0;
          for (let i = 0; i < timeData.length; i++) {
            const dev = Math.abs(timeData[i] - 128);
            if (dev > maxDev) maxDev = dev;
          }
          // Amplify sensitivity: even subtle speech reaches 20-60%
          const pct = Math.min(100, Math.round((maxDev / 48) * 100));
          setMicLevel(pct);

          // Calculate 12 equalizer bars from frequency bands
          const step = Math.floor(freqData.length / 12) || 1;
          const bars = [];
          for (let b = 0; b < 12; b++) {
            const val = freqData[b * step] || 0;
            // Mix frequency with raw peak deviation so bars animate even on subtle speech
            const combined = Math.max(val, maxDev * 2);
            bars.push(Math.max(15, Math.min(100, Math.round((combined / 255) * 100))));
          }
          setWaveBars(bars);

          // Detect silence only if recording has run for > 3 seconds and signal is truly 0
          if (durationRef.current >= 3) {
            if (maxDev < 2) {
              lowVolumeTicks++;
              if (lowVolumeTicks > 60) {
                setIsMicSilent(true);
              }
            } else {
              lowVolumeTicks = 0;
              setIsMicSilent(false);
            }
          }

          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        animFrameRef.current = requestAnimationFrame(updateMeter);
      } catch (err) {
        console.warn('Realtime analyser init skipped:', err);
      }

      // Check supported MediaRecorder mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      const selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const recorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }

        const actualMime = mediaRecorder.mimeType || selectedMime || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        const ext = actualMime.includes('ogg') ? 'ogg' : actualMime.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([audioBlob], `grievance_voice_${Date.now()}.${ext}`, { type: actualMime });
        
        onUpdateFormData({ 
          audioFile: file, 
          audioBlob: audioBlob,
          audioDuration: durationRef.current 
        });

        // Release mic stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      // Start duration counter using ref for reliable closure access
      timerIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
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
            if (!formData.description) {
              onUpdateFormData({ description: transcript.trim() });
            }
          };

          recognition.onerror = () => {};
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }

    } catch (err) {
      console.error('Microphone error:', err);
      setUploadError('Microphone access was denied or not found. Please check browser permissions and Windows microphone settings.');
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  // DISCARD / RE-RECORD
  const handleDiscardAudio = () => {
    stopRecording();
    setAudioUrl(null);
    setRecordingDuration(0);
    durationRef.current = 0;
    setSpeechTranscript('');
    setIsMicSilent(false);
    setMicLevel(0);
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
            /* Active Recording In Progress Box with REAL Audio Visualizer */
            <div className="border-2 border-rose-400 bg-rose-50/30 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    Recording In Progress
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isMicSilent 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isMicSilent ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isMicSilent ? 'Low / Silent Mic' : `Sound Detected (${micLevel}%)`}</span>
                </span>
              </div>

              {/* Live Timer */}
              <div className="text-3xl font-mono font-bold text-slate-800">
                {formatTimer(recordingDuration)}
              </div>

              {/* Real-time Frequency Soundwave */}
              <div className="flex items-center justify-center gap-1.5 h-10 bg-white/70 py-2 px-4 rounded-xl border border-rose-100 max-w-sm mx-auto">
                {waveBars.map((heightPct, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-violet-600 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(15, heightPct)}%` }}
                  />
                ))}
              </div>

              {/* Live Mic VU Volume Level Bar */}
              <div className="max-w-xs mx-auto space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Mic Input Level</span>
                  <span className={micLevel > 5 ? 'text-emerald-600' : 'text-amber-600'}>{micLevel}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${
                      micLevel > 15 ? 'bg-emerald-500' : micLevel > 4 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(2, micLevel)}%` }}
                  />
                </div>
              </div>

              {/* Silence Alert Warning */}
              {isMicSilent && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 max-w-md mx-auto text-left flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">No audio sound detected from microphone!</span>
                    <span className="text-[10px] text-amber-800">
                      Please check that your physical microphone mute switch is OFF and verify Windows microphone volume in Sound Settings.
                    </span>
                  </div>
                </div>
              )}

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
            /* Audio Recorded Preview Card with Volume Booster */
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
                      <span>Ready for playback & submission ({recordingDuration}s)</span>
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

              {/* HTML5 Audio Player */}
              {audioUrl && (
                <div className="pt-1 space-y-2">
                  <audio 
                    ref={audioElRef}
                    controls 
                    src={audioUrl} 
                    className="w-full h-10 rounded-lg" 
                  />

                  {/* Volume Booster & Speaker Diagnostic Tool */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                      <Volume2 className="h-3.5 w-3.5 text-violet-600" />
                      <span>Sound Booster:</span>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                        {[1, 1.5, 2, 3].map((mult) => (
                          <button
                            key={mult}
                            type="button"
                            onClick={() => setGainBoost(mult)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              volumeBoost === mult
                                ? 'bg-violet-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {mult === 1 ? '1x Normal' : `${mult}x`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={testSpeakerTone}
                      className="px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Play a test tone to confirm your speakers/headphones are working"
                    >
                      <span>🔊 Test Speakers</span>
                    </button>
                  </div>
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
                <div className="pt-1 space-y-2">
                  <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="text-[11px]">Audio file attached</span>
                    <button
                      type="button"
                      onClick={testSpeakerTone}
                      className="px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer"
                    >
                      🔊 Test Speakers
                    </button>
                  </div>
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
          Citizen Contact Details
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
