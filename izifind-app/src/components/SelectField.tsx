import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

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
        <Text style={[styles.triggerText, !value ? styles.placeholder : null]}>{selectedLabel}</Text>
      </Pressable>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <Pressable style={styles.cancel} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  trigger: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    color: colors.text,
    fontSize: 15,
  },
  placeholder: {
    color: 'rgba(246,243,234,0.45)',
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.56)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '80%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  cancel: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.accentSoft,
    fontWeight: '700',
  },
});

