import theme from '@/constants/theme'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

type Props = {
  label: string
  active: boolean
  onPress: () => void
  icon?: React.ReactNode
}

const FilterTab = ({ label, active, onPress, icon }: Props) => (
  <TouchableOpacity
    style={[styles.container, active ? styles.active : styles.inactive]}
    onPress={onPress}
  >
    {icon}
    <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2] + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1]
  },
  active: {
    backgroundColor: theme.colors.primary
  },
  inactive: {
    backgroundColor: theme.colors['surface-container-low']
  },
  text: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: '700'
  },
  activeText: {
    color: theme.colors['on-primary']
  },
  inactiveText: {
    color: theme.colors['on-surface-variant']
  }
})

export default FilterTab
