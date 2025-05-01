import React, {useMemo} from 'react';
import {Text} from '@react-navigation/elements';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import colors from '../../assets/colors';

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
    },

    title: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
  });

function Loading({
  title = 'Đang tải dữ liệu...',
  color = colors.primaryColorBold,
}) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export default Loading;
