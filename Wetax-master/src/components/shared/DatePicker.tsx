import { format, parse } from 'date-fns'
import _DatePicker from '@react-native-community/datetimepicker'
import { Text, View, TouchableOpacity, Platform } from 'react-native'
import { createGetStyle } from './helpers'
import { getThemeContext } from '../theme/theme'
import { useContext, useState } from 'react'
import styled from 'styled-components'
import { AntDesign } from '@expo/vector-icons'

export type Props = {
  value: string | null | undefined
  onChange: (val: string) => void
  defaultDate: string
  label: string
}

export const DatePicker = (props: Props) => {
  const { label } = props
  const [showPicker, setShowPicker] = useState(false)

  const theme = useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'input')({})

  const currentDate = parse(props.value || props.defaultDate, 'yyyy.MM.dd', new Date())

  // Convert YYYY.MM.DD to DD.MM.YYYY for display
  const convertToDisplayFormat = (isoDate: string): string => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('.')
    return `${day}.${month}.${year}`
  }

  const displayDate = convertToDisplayFormat(props.value || props.defaultDate)

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        borderWidth: 0,
        alignItems: 'center',
      }}
    >
      <Label style={getStyle('label')}>{label}</Label>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Text style={{ fontSize: 16, marginRight: 8 }}>{displayDate}</Text>
        <AntDesign name="calendar" size={16} color="#666" />
      </TouchableOpacity>

      {showPicker && (
        <_DatePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          themeVariant="light"
          minimumDate={new Date(1900, 0, 1)} // Allow dates from 1900
          maximumDate={new Date(2100, 11, 31)} // Allow dates up to 2100
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowPicker(false)
            }

            if (event.type === 'dismissed') {
              setShowPicker(false)
              return
            }

            if (selectedDate) {
              props.onChange(format(selectedDate, 'yyyy.MM.dd'))
              if (Platform.OS === 'ios') {
                setShowPicker(false)
              }
            }
          }}
        />
      )}
    </View>
  )
}

const Label = styled(Text)``
