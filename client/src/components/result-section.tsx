import { motion } from "framer-motion";
import { Download, WandSparkles, Share, CheckCircle } from "lucide-react";
import SparkleDecoration from "./sparkle-decoration";
import { Star, Sparkles } from "lucide-react";

interface ResultSectionProps {
  originalImageUrl: string;
  coloringPageUrl: string;
  onCreateAnother: () => void;
}

export default function ResultSection({ 
  originalImageUrl, 
  coloringPageUrl, 
  onCreateAnother 
}: ResultSectionProps) {

  const handleDownload = async () => {
    try {
      const response = await fetch(coloringPageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'magical-coloring-page.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my magical coloring page!',
          text: 'I just created this amazing coloring page with Scott Fox Color Book Wizard!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.section 
      className="glass-effect rounded-3xl p-8 glow-effect"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h2 className="font-fredoka text-2xl text-magic-purple mb-2">
          <CheckCircle className="inline w-6 h-6 mr-2 text-magic-green" />
          WandSparkles Complete! ✨
        </h2>
        <p className="font-inter text-gray-600">Your magical coloring page is ready!</p>
      </div>
      
      {/* Result image display */}
      <div className="relative">
        {/* Success sparkles */}
        <SparkleDecoration className="absolute -top-2 -left-2 text-magic-gold">
          <Star className="w-5 h-5" />
        </SparkleDecoration>
        <SparkleDecoration className="absolute -top-1 -right-3 text-magic-green" delay={0.3}>
          <Sparkles className="w-4 h-4" />
        </SparkleDecoration>
        <SparkleDecoration className="absolute -bottom-2 -left-3 text-magic-blue" delay={0.6}>
          <Star className="w-4 h-4" />
        </SparkleDecoration>
        <SparkleDecoration className="absolute -bottom-1 -right-2 text-magic-purple" delay={0.9}>
          <Sparkles className="w-5 h-5" />
        </SparkleDecoration>
        
        {/* Image comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Original photo */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-fredoka text-lg text-gray-700 mb-3">Original Photo</h3>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={originalImageUrl}
                alt="Original photo" 
                className="w-full h-64 object-cover"
              />
            </div>
          </motion.div>
          
          {/* Generated coloring page */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-fredoka text-lg text-gray-700 mb-3">Magical Coloring Page</h3>
            <div className="rounded-xl overflow-hidden shadow-lg bg-white p-4">
              <img 
                src={coloringPageUrl}
                alt="Generated coloring book page" 
                className="w-full h-56 object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Download actions */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.button 
          onClick={handleDownload}
          className="magic-button text-white px-8 py-4 rounded-full font-inter font-medium text-lg"
          whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(107, 70, 193, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-5 h-5 mr-2 inline" />
          Download Your Coloring Page
        </motion.button>
        
        <div className="flex justify-center gap-4">
          <motion.button 
            onClick={onCreateAnother}
            className="text-magic-blue hover:text-magic-purple font-inter font-medium px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <WandSparkles className="w-4 h-4 mr-2 inline" />
            Create Another
          </motion.button>
          <motion.button 
            onClick={handleShare}
            className="text-magic-purple hover:text-magic-gold font-inter font-medium px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share className="w-4 h-4 mr-2 inline" />
            Share WandSparkles
          </motion.button>
        </div>
      </motion.div>
    </motion.section>
  );
}
