import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

const {height} = Dimensions.get('window');

export default function Register1({navigation}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [citizen_id, setCitizen_id] = useState('');
  const [common_name, setCommon_name] = useState('');
  const [dob, setDob] = useState('');
  const [organizational_unit, setOrganizational_unit] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [locality, setLocality] = useState('');
  const [role, setRole] = useState('user');
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setDob(isoDate);
    }
  };

  const handleSignUp = async () => {
    if (
      !validateRequiredFields(
        username,
        email,
        citizen_id,
        common_name,
        dob,
        organizational_unit,
        country,
        state,
        locality,
        role,
      )
    ) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập email hợp lệ.');
      return;
    }

    if (!validateCitizenID(citizen_id)) {
      Alert.alert('CCCD không hợp lệ', 'CCCD phải có đúng 12 số.');
      return;
    }

    try {
      const res = await registerAPI(
        username,
        email,
        citizen_id,
        common_name,
        'Org1',
        organizational_unit,
        country,
        state,
        locality,
        role,
        dob,
      );
      if (res?.success) {
        Alert.alert('Thành công', 'Tạo danh tính thành công!');
        navigation.navigate('home-admin');
      } else {
        Alert.alert('Thất bại', res?.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerBox}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('home-admin')}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Thêm danh tính</Text>
            </View>

            {/* Input fields */}
            {[
              {placeholder: 'Username', value: username, setter: setUsername},
              {placeholder: 'Email', value: email, setter: setEmail},
              {
                placeholder: 'Citizen ID',
                value: citizen_id,
                setter: setCitizen_id,
              },
              {
                placeholder: 'Full Name',
                value: common_name,
                setter: setCommon_name,
              },
              {
                placeholder: 'Organizational Unit',
                value: organizational_unit,
                setter: setOrganizational_unit,
              },
              {placeholder: 'Country', value: country, setter: setCountry},
              {placeholder: 'State', value: state, setter: setState},
              {placeholder: 'Locality', value: locality, setter: setLocality},
              {placeholder: 'Role', value: role, setter: setRole},
            ].map((item, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={item.placeholder}
                placeholderTextColor="#e6f5ff"
                value={item.value}
                onChangeText={item.setter}
              />
            ))}

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
              <Text style={styles.buttonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  innerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    width: '90%',
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderColor: '#e6f5ff',
    borderWidth: 1,
    borderRadius: 8,
    color: '#fff',
  },
  dateInputContainer: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderColor: '#e6f5ff',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    color: '#e6f5ff',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#0084ff',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#0084ff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
