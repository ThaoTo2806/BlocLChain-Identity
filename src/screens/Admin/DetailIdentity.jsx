import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {getUserById, resetPassword} from '../../utils/api';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShareInput from '../../components/ShareInput';

export default function DetailIdentity({navigation}) {
  const route = useRoute();
  const {id} = route.params;
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserById(id);
      if (res.success) {
        setUser(res.users);
      }
    };
    fetchUser();
  }, [id]);

  const handleResetPassword = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn cấp lại mật khẩu?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        onPress: async () => {
          const res = await resetPassword(
            user.common_name,
            user.username,
            user.citizen_id,
          );
          if (res.success) {
            Alert.alert('Thông báo', 'Cấp lại mật khẩu thành công');
          } else {
            Alert.alert('Lỗi', 'Cấp lại mật khẩu thất bại');
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient
      colors={['#0077e6', '#3399ff', '#e6f3ff']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('list-identity')}>
          <Icon name="arrow-left" size={24} color="#fff" />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPassword}>
          <Text style={styles.resetText}>Cấp lại mật khẩu</Text>
          <Icon name="lock-reset" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <ScrollView>
          <Text style={styles.headerText}>Chi tiết danh tính</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Tên danh tính</Text>
            <ShareInput title="Tên danh tính" value={user.common_name} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mã số sinh viên</Text>
            <ShareInput title="MSSV" value={user.username} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Căn cước công dân</Text>
            <ShareInput title="CCCD" value={user.citizen_id} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <ShareInput title="Email" value={user.email} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tổ chức</Text>
            <ShareInput title="Organization" value={user.organization} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Đơn vị</Text>
            <ShareInput
              title="OrganizationUnit"
              value={user.organizational_unit}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Quốc gia</Text>
            <ShareInput title="Country" value={user.country} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tỉnh</Text>
            <ShareInput title="State" value={user.state} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Địa phương</Text>
            <ShareInput title="Locality" value={user.locality} />
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 5,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    paddingLeft: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
