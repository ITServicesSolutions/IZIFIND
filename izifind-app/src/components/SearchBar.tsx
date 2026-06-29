import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, View, Pressable, Animated, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes } from '@/constants/theme';

// ── Safe, conditional import of expo-speech-recognition ─────────────
// The native module only exists after a dev-build (prebuild).  When running
// inside Expo Go the module is absent and the static import crashes the
// whole app.  We therefore try/catch at the module level and fall back to
// no-ops so the rest of the SearchBar still renders normally.
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: ((event: string, handler: (...args: any[]) => void) => void) | null = null;

try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  // Module not available — speech recognition will be silently disabled.
}

// No-op hook used when the real module is not available
function useNoOpSpeechEvent(_event: string, _handler: (...args: any[]) => void) {
  // intentionally empty
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

  // Pick the real hook or the no-op — must be resolved at the top of the
  // component so the same hook is always called on every render (rules of hooks).
  const useSpeechEvent = useSpeechRecognitionEvent ?? useNoOpSpeechEvent;

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

  // Speech recognition event hooks
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

  useSpeechEvent('result', handleResult);
  useSpeechEvent('end', handleEnd);
  useSpeechEvent('error', handleError);

  const handleMicPress = async () => {
    if (!ExpoSpeechRecognitionModule || !voiceAvailable) {
      Alert.alert(
        'Recherche vocale',
        "La recherche vocale n'est pas supportée sur cet appareil ou ce navigateur. Veuillez utiliser la recherche textuelle."
      );
      return;
    }

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
      <Pressable onPress={handleMicPress} style={styles.micButton} accessibilityLabel="Recherche vocale">
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <MaterialCommunityIcons
            name={isListening ? 'microphone' : 'microphone-outline'}
            size={20}
            color={isListening ? colors.lost : colors.primary}
          />
        </Animated.View>
      </Pressable>
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
