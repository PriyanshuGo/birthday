import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Sparkles, Send } from 'lucide-react';

interface WishMessageProps {
  onWishSubmit: (wish: string) => void;
}

export function WishMessage({ onWishSubmit }: WishMessageProps) {
  const [wish, setWish] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (wish.trim()) {
      onWishSubmit(wish);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setWish('');
      }, 3000);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg">Make a Birthday Wish</h3>
      </div>
      
      {!submitted ? (
        <div className="space-y-4">
          <Textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="Write your birthday wish here..."
            className="min-h-[100px] resize-none bg-white/80"
          />
          <Button
            onClick={handleSubmit}
            disabled={!wish.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Wish
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          <p className="text-lg text-purple-600">
            Your wish has been sent to the birthday stars! 🌟
          </p>
        </motion.div>
      )}
    </Card>
  );
}
