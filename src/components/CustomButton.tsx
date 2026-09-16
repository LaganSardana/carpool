import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled = false,
}: CustomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {Icon && (
        <Icon
          size={18}
          color={variant === 'primary' ? '#fff' : '#2563eb'}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          variant === 'secondary' && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: '#cbd5e1',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#2563eb',
  },
  disabledText: {
    color: '#f1f5f9',
  },
});
