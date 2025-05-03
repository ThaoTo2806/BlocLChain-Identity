import React from 'react';
import {TextInput, StyleSheet, View} from 'react-native';

export default function ShareInput({
  value,
  onChangeText,
  placeholder,
  editable = false,
}) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, !editable && styles.readOnly]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        selectTextOnFocus={editable}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  readOnly: {
    color: '#666',
  },
});
