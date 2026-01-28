import { Text, TouchableOpacity, View } from 'react-native'
import { useScreenManager } from '../context/ScreenManager.context'
import { useMemo } from 'react'

const NavButton = (props: { label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        height: 36,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.06)',
      }}
      onPress={props.onPress}
    >
      <Text style={{ color: 'rgba(0,0,0,0.9)', fontSize: 13, fontWeight: 'bold' }}>{props.label}</Text>
    </TouchableOpacity>
  )
}

export const NavigationBar = () => {
  const { next, previous, screen, segments } = useScreenManager()

  const hasValue = useMemo(
    () => !!segments.find((s) => s.screens.includes(screen.name))?.isDone,
    [segments, screen],
  )

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <NavButton label="Zurück" onPress={previous} />
      <NavButton label={hasValue ? 'Weiter' : 'Überspringen'} onPress={next} />
    </View>
  )
}
