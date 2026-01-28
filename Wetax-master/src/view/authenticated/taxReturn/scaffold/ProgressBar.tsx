import { useEffect, useRef } from 'react'
import { Animated, View, useWindowDimensions } from 'react-native'
import { useTheme } from 'styled-components'
import { useScreenManager } from '../context/ScreenManager.context'

const ProgressSegment = (props: {
  isDone: boolean
  width: number
  active: boolean
  isLast: boolean
}) => {
  const theme = useTheme()

  // useEffect(() => {
  //   if (props.isDone) {
  //     Animated.timing(animatedValue, {
  //       toValue: 1,
  //       duration: 200,
  //       useNativeDriver: false,
  //     }).start()
  //   }
  // }, [props.isDone])

  return (
    <View
      style={{
        height: 5,
        width: props.width,
        borderRadius: 5,
        overflow: 'hidden',
        opacity: props.active ? 1 : 0.8,
        backgroundColor: props.active ? 'white' : 'rgba(255,255,255,0.8)',
        borderWidth: 0,
      }}
    >
      <Animated.View
        style={{
          height: 8,
          backgroundColor: props.active ? 'white' : theme.colors.GREEN,
          width: props.isDone ? '100%' : 0,
        }}
      />
    </View>
  )
}

const GUTTER_SIZE = 18
const GAP = 2

export const ProgressBar = () => {
  const { width } = useWindowDimensions()

  const theme = useTheme()
  const { screen, segments } = useScreenManager()

  return (
    <View
      style={{
        height: 20,
        width: '100%',
        backgroundColor: theme.colors.PRIMARY,
        paddingLeft: GUTTER_SIZE,
        padding: 2,
        gap: GAP,
        paddingRight: GUTTER_SIZE,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {segments.map((s, i) => (
        <ProgressSegment
          key={i}
          isDone={s.isDone}
          active={s.screens.includes(screen.name)}
          width={(width - GUTTER_SIZE * 2 - segments.length * GAP - GAP) / segments.length}
          isLast={i === segments.length - 1}
        />
      ))}
    </View>
  )
}
