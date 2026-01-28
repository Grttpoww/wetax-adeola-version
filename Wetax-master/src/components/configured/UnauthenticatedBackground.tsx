import { ScrollView, StatusBar, View } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from 'styled-components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const UnauthenticatedBackground = (props: { children: React.ReactNode }) => {

  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#1D2DBA'} />
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          flexGrow: 1,
          backgroundColor: '#1D2DBA',
          alignItems: 'flex-start',
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <View
          style={{
            paddingTop: 32,
            flex: 1,
            width: '100%',
          }}
        >
          {props.children}
        </View>
      </ScrollView>
    </>
  )
}
