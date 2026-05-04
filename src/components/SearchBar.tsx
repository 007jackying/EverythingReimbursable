import theme from '@/constants/theme'
import { StyleSheet, TextInput, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

const SearchBar = ({ value, onChangeText, placeholder = 'Search receipts...' }: Props) => (
  <View style={styles.container}>
    <MaterialIcons name="search" size={24} color={theme.colors.outline} style={styles.icon} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={`${theme.colors.outline}99`}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing[4]
  },
  icon: {
    marginRight: theme.spacing[3]
  },
  input: {
    flex: 1,
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface']
  }
})

export default SearchBar
