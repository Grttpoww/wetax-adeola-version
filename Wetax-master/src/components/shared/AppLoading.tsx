import React from 'react'
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native'
import styled from 'styled-components'
import { createGetStyle } from './helpers'
import { getThemeContext, Theme } from '../theme/theme'

const AppLoadingWrapper = styled(View)`
  flex: 1;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
`

const MessageWrapper = styled(View)`
  position: absolute;
  width: 100%;
  bottom: 48px;
  left: 0;
  align-items: center;
  justify-content: center;
`

const MessageText = styled(Text)`
  margin-top: 16px;
  font-size: 12px;
  opacity: 0.5;
  color: black;
`

const VersionText = styled(Text)`
  margin-top: 16px;
  font-size: 10px;
  opacity: 0.5;
  color: black;
`

export const AppLoading = (props: {
  messages: Array<string>
  image: ImageSourcePropType
  style?: Partial<Theme['appLoading']>
  version: string
}) => {
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'appLoading')(props.style)
  return props.messages.length === 0 ? null : (
    <AppLoadingWrapper style={getStyle('wrapper')}>
      <Image
        source={props.image}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
        }}
      />

      {props.messages.length > 0 && (
        <MessageWrapper style={getStyle('messageWrapper')}>
          <ActivityIndicator size="small" />
          <MessageText style={getStyle('messageText')}>
            {props.messages[0]}
          </MessageText>
          <VersionText>Version {props.version}</VersionText>
        </MessageWrapper>
      )}
    </AppLoadingWrapper>
  )
}
