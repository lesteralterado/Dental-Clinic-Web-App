'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, ScanFace, QrCode } from 'lucide-react';
import jsQR from 'jsqr';

interface BoxScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageData: string) => Promise<void>;
  onQRScan?: (data: string) => void;
  isProcessing?: boolean;
  type?: 'face' | 'qr';
}

export default function BoxScanner({ isOpen, onClose, onCapture, onQRScan, isProcessing = false, type = 'face' }: BoxScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const facingMode = type === 'qr' ? 'environment' : 'user';
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode, 
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
      setIsReady(true);
      
      // If QR type, start scanning immediately
      if (type === 'qr') {
        setScanning(true);
        scanQRCode();
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Could not access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && scanning) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanning(false);
          console.log('[QR Scanner] Raw QR data:', code.data);
          
          // Try to parse as JSON
          let patientId: string | null = null;
          
          try {
            const data = JSON.parse(code.data);
            console.log('[QR Scanner] Parsed JSON data:', data);
            
            // Handle multiple JSON formats
            if (data.id) {
              patientId = data.id;
              console.log('[QR Scanner] Found patient ID in data.id:', patientId);
            } else if (data.patientId) {
              patientId = data.patientId;
              console.log('[QR Scanner] Found patient ID in data.patientId:', patientId);
            } else if (data.qrCode) {
              // Try to find patient by qrCode
              console.log('[QR Scanner] Found qrCode in data:', data.qrCode);
              // For qrCode, we need to look it up in the check-in page
              patientId = data.qrCode;
            }
          } catch (e) {
            // If not JSON, use as patient ID directly
            console.log('[QR Scanner] Not JSON, using as direct patient ID');
            patientId = code.data;
          }

          if (patientId && onQRScan) {
            onQRScan(patientId);
          } else {
            console.error('[QR Scanner] No valid patient ID found in QR code');
          }
        }
      }

      if (scanning) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const handleCapture = async () => {
    if (!videoRef.current || isProcessing) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        if (onCapture) {
          await onCapture(imageData);
        }
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    }
  };

  const handleClose = () => {
    setScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  const isQR = type === 'qr';
  const Icon = isQR ? QrCode : ScanFace;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    >
      {/* Scanner Box Container */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">
              {isQR ? 'Scan QR Code' : 'Face Recognition'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Camera Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3]">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Camera className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => setIsReady(true)}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56">
                  {/* Corner markers */}
                  {isQR ? (
                    // QR Code - square frame
                    <>
                      <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-500 rounded-br-lg" />
                    </>
                  ) : (
                    // Face - circular frame
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 border-4 border-purple-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Scanning animation for face only */}
              {!isQR && (
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                  animate={{ top: ['20%', '80%', '20%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
            </>
          )}
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex justify-center">
          {isProcessing ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-full">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <span className="text-white text-sm">Processing...</span>
            </div>
          ) : scanning && isQR ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-sm">Scanning...</span>
            </div>
          ) : isReady ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Ready to scan</span>
            </div>
          ) : !error ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full">
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-yellow-400 text-sm">Initializing...</span>
            </div>
          ) : null}
        </div>

        {/* Instructions */}
        <p className="text-center text-white/60 text-sm mt-3">
          {isQR 
            ? 'Position the QR code within the frame' 
            : 'Position the face within the circular frame'}
        </p>

        {/* Action Button */}
        {!isQR && (
          <button
            onClick={handleCapture}
            disabled={!isReady || isProcessing}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Icon className="w-5 h-5" />
                Scan Face
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}