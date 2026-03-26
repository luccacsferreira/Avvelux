import { useState, useCallback } from 'react';

/**
 * Hook that progressively streams text character by character,
 * with a natural pause at the end of each sentence/phrase.
 */
export default function useStreamText() {
  const [displayText, setDisplayText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const streamText = useCallback((fullText, onDone) => {
    setDisplayText('');
    setIsStreaming(true);

    // Split into sentences/phrases
    const phrases = fullText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [fullText];
    let phraseIdx = 0;
    let charIdx = 0;
    let accumulated = '';

    const streamChar = () => {
      if (phraseIdx >= phrases.length) {
        setIsStreaming(false);
        if (onDone) onDone();
        return;
      }

      const phrase = phrases[phraseIdx];

      if (charIdx < phrase.length) {
        accumulated += phrase[charIdx];
        setDisplayText(accumulated);
        charIdx++;
        setTimeout(streamChar, 18);
      } else {
        // End of phrase — pause before next
        phraseIdx++;
        charIdx = 0;
        const pauseMs = Math.min(Math.max(phrase.length * 10, 250), 700);
        setTimeout(streamChar, pauseMs);
      }
    };

    streamChar();
  }, []);

  return { displayText, isStreaming, streamText };
}