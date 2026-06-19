import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, View, Pressable, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes } from '@/constants/theme';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;

try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
  // expo-speech-recognition not installed — voice button hidden
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Rechercher un objet...', onSubmitEditing }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check availability at mount
  useEffect(() => {
    if (!ExpoSpeechRecognitionModule) return;
    (async () => {
      try {
        const available = await ExpoSpeechRecognitionModule.isAvailableAsync();
        setVoiceAvailable(available);
      } catch {
        setVoiceAvailable(false);
      }
    })();
  }, []);

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Speech recognition event hooks (safe to call unconditionally — hooks
  // behind a ref-style guard so they don't break rules of hooks)
  const handleResult = useCallback(
    (ev: any) => {
      const transcript = ev?.results?.[0]?.transcript;
      if (transcript) {
        onChangeText(transcript);
      }
    },
    [onChangeText],
  );

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const handleError = useCallback(() => {
    setIsListening(false);
  }, []);

  // Conditionally register event listeners only if module exists
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent('result', handleResult);
    useSpeechRecognitionEvent('end', handleEnd);
    useSpeechRecognitionEvent('error', handleError);
  }

  const handleMicPress = async () => {
    if (!ExpoSpeechRecognitionModule) return;

    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      return;
    }

    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) return;

      ExpoSpeechRecognitionModule.start({
        lang: 'fr-FR',
        interimResults: true,
      });
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [1, 1.25],
    outputRange: [1, 0.5],
  });

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={isFocused ? colors.primary : colors.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(21, 26, 49, 0.38)"
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      )}
      {voiceAvailable && (
        <Pressable onPress={handleMicPress} style={styles.micButton} accessibilityLabel="Recherche vocale">
          <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
            <MaterialCommunityIcons
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={20}
              color={isListening ? colors.lost : colors.primary}
            />
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.08)',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  containerFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.dark,
    fontSize: fontSizes.md,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  micButton: {
    padding: spacing.xs,
    marginLeft: 2,
  },
});

export default SearchBar;
