import { StyleSheet, Text, View } from 'react-native'

const AboutScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>About screen</Text>
  </View>
)

export default AboutScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#fff'
  }
})
