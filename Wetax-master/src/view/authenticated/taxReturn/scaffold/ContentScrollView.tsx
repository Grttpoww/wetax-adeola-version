import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigationBar } from './NavigationBar'

export const ContentScrollView = ({ navigation, children }: any) => {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      contentContainerStyle={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        paddingBottom: insets.bottom,
        gap: 24,
      }}
    >
      <NavigationBar />
      {children}
    </ScrollView>
  )
}
