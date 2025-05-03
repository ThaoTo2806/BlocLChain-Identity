import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import LinearGradient from 'react-native-linear-gradient';

const storage = new MMKV();

export default function Home({navigation}) {
  const commonName = storage.getString('commonName') || '';
  const id = storage.getString('userId') || '';

  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {commonName}</Text>
      </View>

      <View style={styles.contentBox}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('detail-identity', {id: id})}>
          <Text style={styles.buttonText}>Thông tin danh tính</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('login')}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  contentBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    backgroundColor: '#0077e6',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
});
