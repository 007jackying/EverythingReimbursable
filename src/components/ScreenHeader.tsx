import theme from '@/constants/theme'
import { APP_NAME } from '@/constants/app'
import { StyleSheet, View, Text } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

interface ScreenHeaderProps {
  showMenu?: boolean
  showClose?: boolean
  onClose?: () => void
}

const ScreenHeader = ({ showMenu = true, showClose = false, onClose }: ScreenHeaderProps) => (
  <View style={styles.header}>
    {showMenu && <MaterialIcons name="menu" size={24} color={theme.colors.primary} />}
    {showClose && !showMenu && <View style={styles.placeholder} />}
    <Text style={styles.headerAppName}>{APP_NAME}</Text>
    {showClose ? (
      <MaterialIcons name="close" size={24} color={theme.colors.primary} onPress={onClose} />
    ) : (
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={20} color={theme.colors['on-primary']} />
      </View>
    )}
  </View>
)

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4]
  },
  headerAppName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholder: {
    width: 24
  }
})

export default ScreenHeader
