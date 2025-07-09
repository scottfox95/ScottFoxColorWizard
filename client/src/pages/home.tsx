import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UploadZone from "@/components/upload-zone";
import ProcessingSection from "@/components/processing-section";
import ResultSection from "@/components/result-section";
import SparkleDecoration from "@/components/sparkle-decoration";
import { Star, WandSparkles, Palette, Sparkles, CheckCircle, MessageCircleQuestion, Upload, CloudUpload } from "lucide-react";

export default function Home() {
  const [requestId, setRequestId] = useState<number | null>(null);
  const { toast } = useToast();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/generate-coloring-page", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setRequestId(data.id);
      toast({
        title: "WandSparkles Started! ✨",
        description: "Your photo is being transformed into a coloring page...",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Something went wrong with your photo upload. Please try again!",
        variant: "destructive",
      });
    },
  });

  // Poll for results
  const { data: coloringRequest } = useQuery({
    queryKey: ["/api/coloring-request", requestId],
    enabled: !!requestId,
    refetchInterval: requestId ? 2000 : false, // Poll every 2 seconds
  });

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleCreateAnother = () => {
    setRequestId(null);
    queryClient.invalidateQueries();
  };

  const isProcessing = requestId && (!coloringRequest || coloringRequest.status === "processing");
  const isComplete = coloringRequest?.status === "completed";
  const hasFailed = coloringRequest?.status === "failed";

  return (
    <div className="min-h-screen magic-gradient py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            {/* Floating magical elements */}
            <SparkleDecoration className="absolute -top-4 -left-4 text-magic-gold">
              <Star className="w-8 h-8" />
            </SparkleDecoration>
            <SparkleDecoration className="absolute -top-2 -right-6 text-magic-purple" delay={0.5}>
              <WandSparkles className="w-6 h-6" />
            </SparkleDecoration>
            
            <h1 className="font-fredoka text-5xl md:text-6xl text-magic-purple mb-4 drop-shadow-lg">
              Scott Fox Color Book Wizard
            </h1>
            <p className="font-script text-xl md:text-2xl text-gray-600 mb-2">
              Transform your photos into magical coloring pages ✨
            </p>
            <div className="flex justify-center items-center gap-2 text-magic-blue">
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <WandSparkles className="w-5 h-5" />
              </motion.div>
              <span className="font-inter text-sm">Upload a photo and watch the magic happen!</span>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Palette className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="space-y-8">
          
          {/* Upload Section */}
          {!requestId && (
            <motion.section 
              className="glass-effect rounded-3xl p-8 glow-effect"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-6">
                <h2 className="font-fredoka text-2xl text-magic-purple mb-2">
                  <CloudUpload className="inline w-6 h-6 mr-2" />
                  Step 1: Choose Your Photo
                </h2>
                <p className="font-inter text-gray-600">Drag and drop or click to select your magical photo</p>
              </div>
              
              <UploadZone onFileSelect={handleFileUpload} isUploading={uploadMutation.isPending} />
            </motion.section>
          )}

          {/* Processing Section */}
          {isProcessing && <ProcessingSection />}

          {/* Result Section */}
          {isComplete && coloringRequest && (
            <ResultSection 
              originalImageUrl={coloringRequest.originalImageUrl}
              coloringPageUrl={coloringRequest.coloringPageUrl}
              onCreateAnother={handleCreateAnother}
            />
          )}

          {/* Error State */}
          {hasFailed && (
            <motion.section 
              className="glass-effect rounded-3xl p-8 glow-effect text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="font-fredoka text-2xl text-red-500 mb-4">
                WandSparkles Spell Failed! 😔
              </h2>
              <p className="font-inter text-gray-600 mb-4">
                Something went wrong while creating your coloring page. Please try again!
              </p>
              <button 
                onClick={handleCreateAnother}
                className="magic-button text-white px-6 py-3 rounded-full font-inter font-medium"
              >
                Try Again
              </button>
            </motion.section>
          )}

          {/* How It Works Section */}
          <motion.section 
            className="glass-effect rounded-3xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="font-fredoka text-2xl text-magic-purple text-center mb-6">
              <MessageCircleQuestion className="inline w-6 h-6 mr-2" />
              How the WandSparkles Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="font-fredoka text-lg text-magic-blue mb-2">Upload</h3>
                <p className="font-inter text-sm text-gray-600">Choose any photo from your device</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-3">🪄</div>
                <h3 className="font-fredoka text-lg text-magic-blue mb-2">Transform</h3>
                <p className="font-inter text-sm text-gray-600">AI magic converts it to a coloring page</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-fredoka text-lg text-magic-blue mb-2">Color</h3>
                <p className="font-inter text-sm text-gray-600">Download and start coloring!</p>
              </div>
            </div>
          </motion.section>
          
        </main>
        
      </div>

      {/* Footer */}
      <motion.footer 
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <span className="font-script text-lg">Built with magic</span>
          <SparkleDecoration className="text-magic-gold">
            <Sparkles className="w-5 h-5" />
          </SparkleDecoration>
          <span className="font-script text-lg">by Scott Fox</span>
        </div>
        
        <div className="flex justify-center mt-4 space-x-4">
          <SparkleDecoration className="text-magic-purple">
            <Star className="w-4 h-4" />
          </SparkleDecoration>
          <SparkleDecoration className="text-magic-gold" delay={0.5}>
            <Sparkles className="w-3 h-3" />
          </SparkleDecoration>
          <SparkleDecoration className="text-magic-blue" delay={1}>
            <Star className="w-4 h-4" />
          </SparkleDecoration>
        </div>
      </motion.footer>
    </div>
  );
}
