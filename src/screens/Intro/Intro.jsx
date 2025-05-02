import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {height} = Dimensions.get('window');

export default function Intro({navigation}) {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#0077e6');
  }, []);
  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.innerBox}>
          <Image
            source={require('../../assets/logo-sof.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome to SOF</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('login')}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('register')}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.faceIDContainer}>
            <Icon name="face-recognition" size={30} color="#fff" />
            <Text style={styles.faceIDText}>Now! Quick Login Use Face ID</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'QuentonSerif_PERSONAL_USE_ONLY',
    fontSize: 40,
    color: '#004280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#0084ff',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#0084ff',
    fontWeight: '600',
    textAlign: 'center',
  },
  faceIDContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  faceIDText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
});
