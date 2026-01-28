import { ReactElement, ReactNode, ReactText } from 'react'
import { WebView as WebViewComponent } from 'react-native'
export * from 'react-native'

declare module '*.json' {
  const value: any
  export default value
}

declare module 'react-native' {
  export const WebView: React.FC<{
    source: {
      uri: string
    }
  }> = WebViewComponent

  interface ViewProps {
    children?: any
  }

  interface WebViewProps {
    source: {
      uri: string
    }
  }

  interface ViewStyle {
    style?: any
  }

  interface TouchableOpacityProps {
    children?: any
    style?: any
    pointerEvents?: string
  }

  interface TextProps {
    children?: any
  }

  interface TextInputProps {
    rejectResponderTermination?: boolean
  }
}
