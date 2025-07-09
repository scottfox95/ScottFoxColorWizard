import { motion } from "framer-motion";

const loadingMessages = [
  "Sprinkling fairy dust on your photo...",
  "Mixing magical potions...",
  "Consulting the coloring book spirits...",
  "Transforming pixels into art...",
  "Weaving enchanted lines...",
];

export default function ProcessingSection() {
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <motion.section 
      className="glass-effect rounded-3xl p-8 glow-effect"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="font-fredoka text-2xl text-magic-purple mb-6">
          <span className="mr-2">🪄</span>
          Casting the Magic Spell...
        </h2>
        
        {/* Magical processing animation */}
        <div className="relative mb-8">
          <div className="flex justify-center items-center space-x-4">
            {/* Wizard bouncing */}
            <motion.div 
              className="text-6xl"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🧙‍♂️
            </motion.div>
            
            {/* Magic wand */}
            <motion.div 
              className="text-4xl"
              animate={{ 
                y: [0, -5, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 0.5 
              }}
            >
              🪄
            </motion.div>
            
            {/* Sparkles */}
            <motion.div 
              className="text-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 1
              }}
            >
              ✨
            </motion.div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <div className="w-64 mx-auto bg-white rounded-full h-3 overflow-hidden">
              <motion.div 
                className="sparkle-border h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <p className="font-script text-lg text-magic-blue mt-2">
              Creating your magical coloring page...
            </p>
          </div>
        </div>
        
        {/* Fun loading messages */}
        <div className="text-center">
          <motion.p 
            className="font-inter text-gray-600 italic"
            key={randomMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            "{randomMessage}"
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
