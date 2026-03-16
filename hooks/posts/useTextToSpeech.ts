import { useState, useCallback } from 'react';

export interface TextToSpeechOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    voice?: string;
}

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const checkAvailability = useCallback(async () => {
        if (isAvailable !== null) return isAvailable;

        try {
            await import('expo-speech');
            setIsAvailable(true);
            return true;
        } catch (error) {
            console.warn('expo-speech not available:', error);
            setIsAvailable(false);
            return false;
        }
    }, [isAvailable]);

    const speak = useCallback(async (
        text: string,
        options: TextToSpeechOptions = {}
    ) => {
        try {
            const available = await checkAvailability();
            if (!available) {
                throw new Error('Text-to-speech not available');
            }

            const Speech = await import('expo-speech');

            if (isSpeaking) {
                await Speech.stop();
                setIsSpeaking(false);
                setIsPaused(false);
                return;
            }

            // Truncate text if it's too long (speech synthesis has limits)
            const maxLength = 5000; // Reasonable limit for speech synthesis
            const truncatedText = text.length > maxLength
                ? text.substring(0, maxLength) + '... (content truncated)'
                : text;

            const defaultOptions: TextToSpeechOptions = {
                language: 'en-US',
                pitch: 1.0,
                rate: 0.9,
                ...options,
            };

            setIsSpeaking(true);
            setIsPaused(false);

            await Speech.speak(truncatedText, {
                language: defaultOptions.language,
                pitch: defaultOptions.pitch,
                rate: defaultOptions.rate,
                voice: defaultOptions.voice,
                onDone: () => {
                    setIsSpeaking(false);
                    setIsPaused(false);
                },
                onStopped: () => {
                    setIsSpeaking(false);
                    setIsPaused(false);
                },
                onError: (error) => {
                    console.error('Speech error:', error);
                    setIsSpeaking(false);
                    setIsPaused(false);
                },
            });
        } catch (error) {
            console.error('Error starting speech:', error);
            setIsSpeaking(false);
            setIsPaused(false);
            throw error;
        }
    }, [isSpeaking, checkAvailability]);

    const stop = useCallback(async () => {
        try {
            const available = await checkAvailability();
            if (!available) return;

            const Speech = await import('expo-speech');
            await Speech.stop();
            setIsSpeaking(false);
            setIsPaused(false);
        } catch (error) {
            console.error('Error stopping speech:', error);
        }
    }, [checkAvailability]);

    const pause = useCallback(async () => {
        try {
            const available = await checkAvailability();
            if (!available) return;

            const Speech = await import('expo-speech');
            await Speech.pause();
            setIsPaused(true);
        } catch (error) {
            console.error('Error pausing speech:', error);
        }
    }, [checkAvailability]);

    const resume = useCallback(async () => {
        try {
            const available = await checkAvailability();
            if (!available) return;

            const Speech = await import('expo-speech');
            await Speech.resume();
            setIsPaused(false);
        } catch (error) {
            console.error('Error resuming speech:', error);
        }
    }, [checkAvailability]);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isAvailable,
    };
}; 