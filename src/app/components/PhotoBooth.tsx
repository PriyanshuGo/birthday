import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, Download, X } from 'lucide-react';
import { MoreVertical } from "lucide-react";
import { useState } from 'react';
interface PhotoBoothProps {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

export function PhotoBooth({ photos, setPhotos }: PhotoBoothProps) {

  const [openMenu, setOpenMenu] = useState<number | null>(null);

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4"
        onClick={() => setOpenMenu(null)}>
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
              <div className="absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't let the click reach the gallery
                    setOpenMenu(openMenu === index ? null : index);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {openMenu === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute top-12 right-2 bg-white rounded-xl shadow-xl border overflow-hidden z-20 min-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          downloadPhoto(photo, index);
                          setOpenMenu(null);
                        }}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>

                      <button
                        onClick={() => {
                          deletePhoto(index);
                          setOpenMenu(null);
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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