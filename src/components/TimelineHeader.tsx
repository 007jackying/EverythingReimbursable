import theme from '@/constants/theme'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  label: string
}

const TimelineHeader = ({ label }: Props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[1]
  },
  text: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${theme.colors['on-surface-variant']}80`,
    textTransform: 'uppercase'
  }
})

export default TimelineHeader
