import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  validateEmail,
  validateCitizenID,
  validateRequiredFields,
} from '../../utils/validators';
import {registerAPI} from '../../utils/api';
import {MMKV} from 'react-native-mmkv';

const {height} = Dimensions.get('window');

export default function Register({navigation}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [citizen_id, setCitizen_id] = useState('');
  const [common_name, setCommon_name] = useState('');
  const [dob, setDob] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0]; // format YYYY-MM-DD
      setDob(isoDate);
    }
  };

  const handleSignUp = async () => {
    if (!validateRequiredFields(username, email, citizen_id, common_name)) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!validateCitizenID(citizen_id)) {
      Alert.alert(
        'Invalid Citizen ID',
        'Citizen ID must be exactly 12 digits.',
      );
      return;
    }

    try {
      const res = await registerAPI(
        username,
        email,
        citizen_id,
        common_name,
        'Org1',
        'IT',
        'US',
        'California',
        'San Francisco',
        'user',
        dob,
      );
      console.log('res: ', res?.success);

      if (res?.success === true) {
        Alert.alert('Notification', 'Registration successful');
        navigation.navigate('login');
      } else if (res?.success === false) {
        Alert.alert('Register Failed', res?.message);
      }
    } catch (error) {
      Alert.alert('Register Error', 'An unexpected error occurred.');
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
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#e6f5ff"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#e6f5ff"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Citizen ID"
            placeholderTextColor="#e6f5ff"
            value={citizen_id}
            onChangeText={setCitizen_id}
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#e6f5ff"
            value={common_name}
            onChangeText={setCommon_name}
          />

          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => setShowPicker(true)}>
            <Text style={styles.dateInputText}>
              {dob || 'Date of Birth (YYYY-MM-DD)'}
            </Text>
            <Icon name="calendar" size={22} color="#e6f5ff" />
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dob ? new Date(dob) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('login')}
              style={styles.footerContainer}>
              <Text style={styles.footerText}> I'm already a member. </Text>
              <Text style={styles.footerText1}>Login</Text>
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
  dateInputContainer: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderColor: '#e6f5ff',
    borderWidth: 1,
    borderRadius: 8,
    color: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    color: '#e6f5ff',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
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
});
