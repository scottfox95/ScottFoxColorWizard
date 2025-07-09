import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Image, Plus } from "lucide-react";
import SparkleDecoration from "./sparkle-decoration";
import { Star, Sparkles } from "lucide-react";
import heic2any from "heic2any";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export default function UploadZone({ onFileSelect, isUploading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndProcessFile = async (file: File) => {
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!supportedFormats.includes(file.type)) {
      // Check if it's a HEIC file (iPhone format)
      const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' || 
                    file.name.toLowerCase().endsWith('.heic') || 
                    file.name.toLowerCase().endsWith('.heif');
      
      if (isHEIC) {
        await convertHEICToJPEG(file);
      } else {
        alert('✨ This image format is not supported. Please use JPG, PNG, GIF, WebP, or HEIC formats.');
      }
      return;
    }
    
    onFileSelect(file);
  };

  const convertHEICToJPEG = async (file: File) => {
    try {
      console.log('Converting HEIC file to JPEG...');
      
      // Convert HEIC to JPEG using heic2any
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });
      
      // Handle the case where heic2any returns an array
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      // Create a new File from the converted blob
      const convertedFile = new File([blob], 'converted-image.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('HEIC conversion successful!');
      onFileSelect(convertedFile);
      
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      alert('❌ Failed to convert HEIC image. Please try saving it as JPG first or use a different photo.');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        await validateAndProcessFile(file);
      } else {
        alert('✨ Please upload an image file! We support JPG, PNG, GIF, WebP, and HEIC formats.');
      }
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await validateAndProcessFile(files[0]);
    }
  }, [onFileSelect]);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.heic,.heif';
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        await validateAndProcessFile(files[0]);
      }
    };
    input.click();
  };

  return (
    <motion.div 
      className={`upload-zone rounded-2xl p-12 cursor-pointer relative overflow-hidden transition-all duration-300 ${
        isDragOver ? 'scale-102 border-magic-gold bg-gradient-to-br from-magic-purple/20 to-magic-blue/20' : ''
      } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Sparkle decorations */}
      <SparkleDecoration className="absolute top-4 left-4 text-magic-gold">
        <Sparkles className="w-4 h-4" />
      </SparkleDecoration>
      <SparkleDecoration className="absolute top-6 right-8 text-magic-purple" delay={0.5}>
        <Star className="w-4 h-4" />
      </SparkleDecoration>
      <SparkleDecoration className="absolute bottom-4 left-8 text-magic-blue" delay={1}>
        <Sparkles className="w-4 h-4" />
      </SparkleDecoration>
      <SparkleDecoration className="absolute bottom-6 right-4 text-magic-gold" delay={1.5}>
        <Star className="w-4 h-4" />
      </SparkleDecoration>
      
      <div className="text-center">
        <motion.div 
          className="mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Image className="w-16 h-16 text-magic-purple mx-auto" />
        </motion.div>
        <h3 className="font-fredoka text-xl text-magic-purple mb-2">
          {isUploading ? "Uploading..." : "Drop your photo here"}
        </h3>
        <p className="font-inter text-gray-500 mb-2">
          {isUploading ? "Please wait while we process your image" : "or click to browse your files"}
        </p>
        {!isUploading && (
          <p className="font-inter text-xs text-gray-400 mb-4">
            Supports: JPG, PNG, GIF, WebP, HEIC • iPhone photos converted automatically ✨
          </p>
        )}
        {!isUploading && (
          <motion.button 
            className="magic-button text-white px-6 py-3 rounded-full font-inter font-medium"
            whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(107, 70, 193, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Choose Photo
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
