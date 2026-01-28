import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Lens } from 'monocle-ts'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from 'styled-components'
import { Button, ButtonType } from '../../../../components/shared'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { TaxReturnData } from '../../../../openapi'
import { useArrayManager } from '../context/ArrayManager.context'
import { useScreenManager } from '../context/ScreenManager.context'
import { ContentScrollView } from '../scaffold/ContentScrollView'
import { ScreenArrayOverview, TaxReturnDataKey } from '../types'
import { SCREENS } from '../screens'
import { ScreenEnum } from '../enums'

export const ArrayOverviewTemplate = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenArrayOverview<T, U>
}) => {
  const theme = useTheme()
  const { update, taxReturn } = useTaxReturn()
  const { setScreen, next, awaitNext } = useScreenManager()
  const { setIndex, removeItem, data } = useArrayManager<U>()

  const { screen } = props

  const array = data || []

  console.log('=== ArrayOverview Rendering ===')
  console.log('Screen:', screen.name)
  console.log('Data array:', JSON.stringify(array, null, 2))
  console.log('Array length:', array.length)

  const lens = Lens.fromPath<TaxReturnData>()([screen.dataKey, 'finished'])

  return (
    <ContentScrollView>
      <View
        style={{
          flex: 1,
          gap: 16,
        }}
      >
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

        {!screen.text && array.length === 0 && (
          <View>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.TEXT,
                opacity: 0.5,
              }}
            >
              Keine Einträge
            </Text>
          </View>
        )}

        {array.map((item, index) => (
          <View
            key={index}
            style={{
              height: 48,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity
              style={{
                height: 55,
                borderRadius: 10,
                flex: 1,
                backgroundColor: 'white',
                // paddingLeft: 16,
                // paddingRight: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: theme.colors.BORDER_GRAY,
                flexDirection: 'row',
                paddingVertical: 10,
                paddingHorizontal: 16,
              }}
              onPress={() => {
                setScreen(screen.detailScreen)
                setIndex(index)
              }}
            >
              <View>
                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{screen.getLabel(item)}</Text>
                {screen.getSublabel && (
                  <Text style={{ fontSize: 13, fontWeight: '400', opacity: 0.7 }}>
                    {screen.getSublabel(item)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f7e1e1',
                }}
                onPress={(e) => {
                  e.stopPropagation()
                  removeItem(index)
                }}
              >
                {/* <Ionicons name="trash-bin" size={16} color="#a60202" /> */}
                <AntDesign name="delete" size={20} color="#a60202" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ gap: 16, marginTop: 'auto' }}>
        <Button
          label={'Hinzufügen'}
          type={ButtonType.ChromelessDark}
          disabled={screen.maxItems !== undefined && array.length >= screen.maxItems}
          onPress={() => {
            // Set index to add new item at the end of the array
            setIndex(array.length)

            if (screen.name === ScreenEnum.GeldVerdientOverview) {
              setScreen(ScreenEnum.LohnausweisHochladen)
              return
            }
            if (screen.name === ScreenEnum.BankkontoOverview) {
              setScreen(ScreenEnum.BankkontoHochladen)
              return
            }
            setScreen(screen.detailScreen)
          }}
          style={{
            background: {
              borderRadius: 30,
              height: 55,
            },
          }}
        />
        <Button
          label={'Weiter'}
          type={ButtonType.Dark}
          onPress={() => {
            update(lens.set(true)(taxReturn.data))

            const nextScreen = SCREENS.findIndex((v) => v.name === props.screen.detailScreen)

            // Special case: InAusbildungOverview should go directly to the next screen after detail
            const offset = screen.name === ScreenEnum.InAusbildungOverview ? 1 : 2

            setScreen(SCREENS[nextScreen + offset].name)
          }}
          style={{
            background: {
              borderRadius: 30,
              height: 55,
            },
          }}
        />
      </View>
    </ContentScrollView>
  )
}
