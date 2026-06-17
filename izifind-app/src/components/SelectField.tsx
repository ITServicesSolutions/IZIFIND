import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  label: string;
  value: string | number | null;
  options: SelectOption[];
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  helperText?: string;
}

export function SelectField({ label, value, options, onChange, placeholder = 'Choisir une valeur', helperText }: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => String(option.value) === String(value))?.label ?? placeholder,
    [options, placeholder, value]
  );

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={[styles.triggerText, !value ? styles.placeholderText : null]}>
          {selectedLabel}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      <Modal 
        visible={visible} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.dark} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = String(item.value) === String(value);
                return (
                  <Pressable
                    style={[styles.option, isSelected ? styles.optionSelected : null]}
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.list}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  trigger: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.1)',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    color: colors.dark,
    fontSize: fontSizes.md,
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(21, 26, 49, 0.38)',
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.dark,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    backgroundColor: 'rgba(244, 149, 23, 0.04)',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    color: colors.dark,
    fontSize: fontSizes.md,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.05)',
  },
});


