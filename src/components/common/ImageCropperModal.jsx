import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/lib/theme';

const ImageCropperModal = ({ open, onOpenChange, image, onCropComplete }) => {
  const { isLight } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropEnd = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${isLight ? 'bg-white border-gray-200 text-black' : 'bg-[#1a1a1a] border-gray-800 text-white'} p-0 overflow-hidden`}>
        <DialogHeader className={`p-4 border-b ${isLight ? 'border-gray-200' : 'border-gray-800'} flex flex-row items-center justify-between space-y-0`}>
          <DialogTitle className="text-lg">Crop Image</DialogTitle>
          <button onClick={() => onOpenChange(false)} className={`p-1 ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'} rounded-full transition-colors`}>
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="relative w-full h-80 bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropEnd}
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut className={`w-4 h-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`}
            />
            <ZoomIn className={`w-4 h-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className={`flex-1 py-2.5 rounded-xl transition-all font-bold ${
                isLight 
                  ? 'bg-gray-200 hover:bg-gray-300 text-black' 
                  : 'bg-[#2a2a2a] hover:bg-[#333] text-white'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 transition-opacity font-bold text-white flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;
