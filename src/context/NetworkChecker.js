import React, {useEffect, useMemo, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import colors from '../assets/colors';

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryColorLight,
    },

    card: {
      width: '85%',
      paddingVertical: 20,
      alignItems: 'center',
      elevation: 10,
      backgroundColor: '#fff',
    },

    icon: {
      fontSize: 50,
      textAlign: 'center',
      marginBottom: 10,
      color: 'red',
    },

    title: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },

    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: 'gray',
      marginBottom: 20,
    },

    button: {
      marginTop: 10,
      backgroundColor: colors.secondColor,
    },
  });

const NetworkChecker = ({children}) => {
  const [isConnected, setIsConnected] = useState(true);
  const styles = useMemo(() => createStyles(), []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.icon}>⚠</Text>
            <Text style={styles.title}>Không có kết nối mạng!</Text>
            <Text style={styles.subtitle}>
              Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
            </Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.button}>
              Thử lại
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return children;
};

export default NetworkChecker;
