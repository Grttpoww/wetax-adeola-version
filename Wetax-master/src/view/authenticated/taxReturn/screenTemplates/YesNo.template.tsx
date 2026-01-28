import { Lens } from 'monocle-ts'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from 'styled-components'
import { Button, ButtonType } from '../../../../components/shared'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { TaxReturnData } from '../../../../openapi'
import { useScreenManager } from '../context/ScreenManager.context'
import { ContentScrollView } from '../scaffold/ContentScrollView'
import { ScreenYesNo, TaxReturnDataKey } from '../types'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'

export const YesNoTemplate = <T extends TaxReturnDataKey>(props: { screen: ScreenYesNo<T> }) => {
  const { taxReturn, update } = useTaxReturn()
  const { awaitNext, setScreen } = useScreenManager()
  const theme = useTheme()

  const { screen } = props

  const lens = Lens.fromPath<TaxReturnData>()([screen.dataKey, 'start'])

  const value = lens.get(taxReturn.data)

  return (
    <ContentScrollView>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.colors.PRIMARY,
          alignSelf: 'center',
        }}
      >
        {screen.question}
      </Text>
      {screen.text && (
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.TEXT,
            opacity: 0.5,
          }}
        >
          {screen.text}
        </Text>
      )}
      <View style={{ gap: 16 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            const updatedData = lens.set(true)(taxReturn.data)
            const finalData = screen.update
              ? screen.update({ ...taxReturn.data[screen.dataKey], start: true }, updatedData)
              : updatedData
            update(finalData)
            if (screen.yesScreen) {
              setScreen(screen.yesScreen)
            } else {
              awaitNext()
            }
          }}
          style={{
            height: 50,
            borderWidth: 1,
            borderColor: '#1d2dba',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 30,
            flexDirection: 'row',
            paddingHorizontal: 25,
            backgroundColor: value === true ? '#1d2dba' : '#fff',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: value === true ? '#fff' : '#1d2dba' }}>
            {'Ja'}
          </Text>
          {value === true ? (
            <Ionicons name="checkmark-done-circle" size={20} color="#06ba18" />
          ) : (
            <Ionicons name="arrow-forward-circle-outline" size={22} color="#1d2dba" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            const updatedData = lens.set(false)(taxReturn.data)
            const finalData = screen.update
              ? screen.update({ ...taxReturn.data[screen.dataKey], start: false }, updatedData)
              : updatedData
            update(finalData)
            if (screen.noScreen) {
              setScreen(screen.noScreen)
            } else {
              awaitNext()
            }
          }}
          style={{
            height: 50,
            borderWidth: 1,
            borderColor: '#1d2dba',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 30,
            flexDirection: 'row',
            paddingHorizontal: 25,
            backgroundColor: value === false ? '#1d2dba' : '#fff',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: value === false ? '#fff' : '#1d2dba' }}>
            {'Nein'}
          </Text>
          {value === false ? (
            <Ionicons name="checkmark-done-circle" size={20} color="#06ba18" />
          ) : (
            <Ionicons name="arrow-forward-circle-outline" size={22} color="#1d2dba" />
          )}
        </TouchableOpacity>
        {/* <Button
          label={'Ja'}
          type={value === true ? ButtonType.Dark : ButtonType.ChromelessDark}
          // style={
          //   value === true
          //     ? {
          //         background: {
          //           backgroundColor: '#06ba18',
          //         },
          //       }
          //     : {}
          // }
          hasCheckmark={value === true}
          onPress={() => {
            awaitNext()
            update(lens.set(true)(taxReturn.data))
          }}
        /> */}
        {/* <Button
          label={'Nein'}
          type={value === false ? ButtonType.Dark : ButtonType.ChromelessDark}
          hasCheckmark={value === false}
          // style={
          //   value === false
          //     ? {
          //         background: {
          //           backgroundColor: '#06ba18',
          //         },
          //       }
          //     : {}
          // }
          onPress={() => {
            awaitNext()
            update(lens.set(false)(taxReturn.data))
          }}
        /> */}
      </View>
    </ContentScrollView>
  )
}
