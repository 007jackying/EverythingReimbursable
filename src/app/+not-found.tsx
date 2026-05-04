import theme from '@/constants/theme'
import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Not Found' }} />
    <View style={styles.container}>
      <Text style={styles.text}>This screen does not exist.</Text>
      <Link href="/" style={styles.link}>
        Go to home screen
      </Link>
    </View>
  </>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing[4]
  },
  text: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 18,
    color: theme.colors['on-surface']
  },
  link: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary
  }
})

export default NotFoundScreen
