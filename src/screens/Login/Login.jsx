import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {validateRequiredFields} from '../../utils/validators';
import {loginAPI} from '../../utils/api';
import {MMKV} from 'react-native-mmkv';

const {height} = Dimensions.get('window');
const storage = new MMKV();

export default function Login({navigation}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const toggleSecureText = () => {
    setSecureText(!secureText);
  };

  const handleSignIn = async () => {
    if (!validateRequiredFields(username, password)) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      // console.log('username: ', username);
      // console.log('p: ', password);
      const res = await loginAPI(username, password);
      console.log('res: ', res);

      if (res.data.success === true) {
        // Lưu dữ liệu bằng MMKV
        const storageItems = {
          access_token: res.data.token,
          username,
          commonName: res.data.common_name,
          role: res.data.role,
          userId: JSON.stringify(res.data.id),
        };
        Object.entries(storageItems).forEach(([key, value]) =>
          storage.set(key, value),
        );

        if (res.data.role === 'admin') {
          navigation.navigate('home-admin');
        } else if (res.data.role === 'user') {
          if (res.data.code === 'LOGIN_SUCCESS') {
            const {common_name} = res.data;
            navigation.navigate('home-user', {
              username,
              commonName: common_name,
              userId: res.data.id,
            });
          }
        }
      } else {
        switch (res.data.code) {
          case 'USER_NOT_FOUND':
            Alert.alert('Login Failed', 'Username does not exist!');
            break;
          case 'INVALID_CREDENTIALS':
            Alert.alert('Login Failed', 'Incorrect password!');
            break;
          default:
            Alert.alert(
              'Login Error',
              'An error occurred. Please try again later.',
            );
            break;
        }
      }
    } catch (error) {
      Alert.alert('Login Error', 'An unexpected error occurred.');
    }
  };

  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <View style={styles.safeArea}>
        <View style={styles.innerBox}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#e6f5ff"
            value={username}
            onChangeText={setUsername}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#e6f5ff"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={toggleSecureText}
              style={styles.iconContainer}>
              <Icon
                name={secureText ? 'eye-off' : 'eye'}
                size={24}
                color="#e6f5ff"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => alert('Forgot password')}
            style={styles.forgetContainer}>
            <Text style={styles.footerText2}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('register')}
              style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Text style={styles.footerText1}> Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  title: {
    fontFamily: 'QuentonSerif_PERSONAL_USE_ONLY',
    fontSize: 40,
    color: '#004280',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderColor: '#e6f5ff',
    borderWidth: 1,
    borderRadius: 8,
    color: '#333',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#0084ff',
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '65%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#0084ff',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgetContainer: {
    alignSelf: 'flex-end',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  footerText1: {
    color: '#004280',
    fontSize: 14,
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
  footerText2: {
    color: '#004280',
    fontSize: 14,
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
});
