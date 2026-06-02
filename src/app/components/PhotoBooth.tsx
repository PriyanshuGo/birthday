import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, Download, X } from 'lucide-react';

interface PhotoBoothProps {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

export function PhotoBooth({ photos, setPhotos }: PhotoBoothProps) {
  const downloadPhoto = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.download = `birthday-photo-${index + 1}.png`;
    link.href = imageData;
    link.click();
  };

  const deletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">📸 Photo Gallery</h2>
      </div>

      {/* Photo gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {photos.map((photo, index) => (
            <motion.div
              key={photo + index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative group aspect-square"
            >
              <img
                src={photo}
                alt={`Birthday photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-lg transform scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => downloadPhoto(photo, index)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePhoto(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No photos yet. Take your first birthday selfie using the button under the camera!</p>
        </div>
      )}
    </Card>
  );
}