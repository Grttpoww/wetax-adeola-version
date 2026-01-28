import { StatusBar } from 'expo-status-bar'
import { ReactNode } from 'react'
import { KeyboardAvoidingView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CategoryBar } from './CategoryBar'
import { ProgressBar } from './ProgressBar'
import { TitleBar } from './TitleBar'
import { TopBar } from './TopBar'
import { useScreenManager } from '../context/ScreenManager.context'

export const TemplateScaffold = (props: { children: ReactNode; navigation: any }) => {
  const insets = useSafeAreaInsets()
  const { category } = useScreenManager()

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        backgroundColor: '#1D2DBA',
      }}
    >
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: 'rgb(26,36,146)', width: '100%' }} />
      <TopBar navigation={props.navigation} />
      <CategoryBar />
      <TitleBar />
      <ProgressBar key={category} />
      <KeyboardAvoidingView
        behavior={'height'}
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: '#fff',
        }}
      >
        {props.children}
      </KeyboardAvoidingView>
    </View>
  )
}
