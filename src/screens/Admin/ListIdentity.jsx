import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getAllUsers} from '../../utils/api';
import ShareButton from '../../components/ShareButton';

const {width} = Dimensions.get('window');

export default function ListIdentity({navigation}) {
  const [listUser, setListUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUsers();
      if (res?.success === true) {
        const data = res?.users.map(user => ({
          title: user.common_name,
          id: user.id,
          dob: user.dob,
        }));
        setListUser(data);
      }
    };
    fetchData();
  }, []);

  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <View style={styles.header}>
        <Text style={styles.userName}>Danh sách danh tính</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.buttonContainer}
        data={listUser}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.itemWrapper}>
            <ShareButton
              name={item.title}
              onPress={() =>
                navigation.navigate('detail-identity', {id: item.id})
              }
              btnStyles={styles.button}
              textStyles={styles.buttonText}
            />
            <TouchableOpacity style={styles.iconButton2}>
              <Icon name="information-outline" size={22} color="#0077e6" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('home-admin')}>
          <Icon name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backText}>Quay lại</Text>
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  itemWrapper: {
    marginBottom: 15,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#0077e6',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  iconButton1: {
    position: 'absolute',
    top: 15,
    right: 50,
  },
  iconButton2: {
    position: 'absolute',
    top: 12,
    right: 15,
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0077e6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
