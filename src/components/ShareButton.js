import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

export default function ShareButton({name, onPress, btnStyles, textStyles}) {
  return (
    <TouchableOpacity style={[styles.button, btnStyles]} onPress={onPress}>
      <Text style={[styles.text, textStyles]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  text: {
    color: '#0077e6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
