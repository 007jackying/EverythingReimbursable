import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { Redirect, Tabs, router } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

const ScanFAB = () => (
  <Pressable style={styles.fabContainer} onPress={() => router.push('/(main)/scan')}>
    <View style={styles.fabRing}>
      <View style={styles.fab}>
        <MaterialCommunityIcons name="line-scan" size={28} color={theme.colors['on-secondary']} />
      </View>
    </View>
    <Text style={styles.fabLabel}>SCAN</Text>
  </Pressable>
)

const TabLayout = () => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: `${theme.colors.background}CC`,
          borderTopWidth: 0,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...theme.shadows.md
        },
        tabBarActiveTintColor: theme.colors['on-primary'],
        tabBarInactiveTintColor: `${theme.colors.primary}99`,
        tabBarLabelStyle: {
          fontFamily: theme.fontFamily.mono,
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginTop: 4
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeBadge : undefined}>
              {focused ? (
                <MaterialIcons name="home" size={24} color={theme.colors['on-primary']} />
              ) : (
                <MaterialCommunityIcons name="home-outline" size={24} color={color} />
              )}
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeBadge : undefined}>
              <MaterialIcons
                name="history"
                size={24}
                color={focused ? theme.colors['on-primary'] : color}
              />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: () => null,
          tabBarLabel: () => null,
          tabBarButton: () => <ScanFAB />,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeBadge : undefined}>
              {focused ? (
                <MaterialIcons name="person" size={24} color={theme.colors['on-primary']} />
              ) : (
                <MaterialIcons name="person-outline" size={24} color={color} />
              )}
            </View>
          )
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  activeBadge: {
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3]
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8
  },
  fabRing: {
    position: 'absolute',
    top: -28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fabLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 1.5
  }
})

export default TabLayout
