import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: LucideIcon;
  secureTextEntry?: boolean;
}

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  secureTextEntry = false,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        {Icon && <Icon size={18} color="#64748b" style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
});
