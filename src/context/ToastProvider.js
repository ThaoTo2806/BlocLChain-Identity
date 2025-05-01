import React, {createContext, useState, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar} from 'react-native-paper';
import colors from '../assets/colors';

export const ToastContext = createContext();

const createStyles = type =>
  StyleSheet.create({
    snackbar: {
      backgroundColor: type === 'success' ? colors.primaryColorBold : '#ff4d4d',
    },

    action: {
      color: '#fff',
    },
  });

const ToastProvider = ({children}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  const styles = useMemo(() => createStyles(type), [type]);

  const showToast = (msg, toastType = 'success', duration = 3000) => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={styles.snackbar}
        action={{
          label: 'Đóng',
          onPress: () => setVisible(false),
          labelStyle: styles.action,
        }}>
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
