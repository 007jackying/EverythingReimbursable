import theme from '@/constants/theme'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'

const AuthLayout = () => (
  <View style={styles.container}>
    {/* eslint-disable-next-line react/style-prop-object */}
    <StatusBar style="dark" backgroundColor={theme.colors.background} />
    <Slot />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  }
})

export default AuthLayout
