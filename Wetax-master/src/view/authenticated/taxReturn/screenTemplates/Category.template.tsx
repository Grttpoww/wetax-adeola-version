import { AntDesign, Ionicons, Octicons } from '@expo/vector-icons'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components'
import { Button, ButtonType } from '../../../../components/shared'
import { useScreenManager } from '../context/ScreenManager.context'
import { ScreenCategory } from '../types'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { ScreenEnum } from '../enums'

export const CategoryTemplate = (props: { screen: ScreenCategory }) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { setScreen, next, screen, categoryScreens, segments } = useScreenManager()
  const { taxReturn } = useTaxReturn()

  return (
    <>
      <View
        style={{
          flex: 1,

          backgroundColor: theme.colors.BACKGROUND,
          paddingBottom: insets.bottom,
        }}
      >
        {/* <View
          style={{
            width: '100%',
            paddingLeft: 24,
            paddingTop: 16,
            paddingBottom: 16,
            paddingRight: 48,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '600', marginRight: 'auto' }}>{screen.title}</Text>

          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
            coverRadius={0.01}
            coverFill={theme.colors.BACKGROUND}
          />
        
        </View> */}

        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: 0,
            // paddingTop: 32,
          }}
        >
          <View
            style={{
              // borderWidth: 1,
              paddingTop: 8,
              paddingBottom: 8,
              // borderColor: 'rgba(0,0,0,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
            }}
          >
            {segments.map((segment, i) => (
              <TouchableOpacity
                onPress={() => {
                  let targetScreen = segment.screens[0]

                  // Special case: If clicking Auto/Motorrad zur Arbeit and array has data, go to overview
                  if (segment.key === 'SubAutoMotorradArbeit') {
                    const autoMotorradArbeitWegeData = taxReturn.data.autoMotorradArbeitWege?.data || []
                    if (autoMotorradArbeitWegeData.length > 0) {
                      targetScreen = ScreenEnum.AutoMotorradArbeitWegeOverview
                    }
                  }

                  // Special case: If clicking Bankkonto and array has data, go to overview
                  if (segment.key === 'SubBankkonto') {
                    const bankkontoData = taxReturn.data.bankkonto?.data || []
                    if (bankkontoData.length > 0) {
                      targetScreen = ScreenEnum.BankkontoOverview
                    }
                  }

                  setScreen(targetScreen)
                }}
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 16,
                  paddingBottom: 16,
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  // borderBottomWidth: 1,
                  // borderBottomColor: 'rgba(0,0,0,0.15)',
                  ...(i === segments.length - 1 && { borderBottomWidth: 0 }),
                }}
                key={i}
              >
                <Text style={{ fontWeight: '600', marginRight: 'auto', fontSize: 14 }}>
                  {segment.name}
                </Text>

                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {segment.isDone ? (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.GREEN} />
                  ) : (
                    <AntDesign name="exclamation-circle" size={16} color="rgba(0,0,0,0.25)" />
                  )}
                </View>

                <Octicons name="chevron-right" size={16} color="rgba(0,0,0,0.2)" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ gap: 16, marginTop: 'auto', paddingLeft: 24, paddingRight: 24 }}>
          <TouchableOpacity
            onPress={next}
            activeOpacity={0.7}
            style={{
              height: 50,
              backgroundColor: '#1d2dba',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, color: '#fff', fontWeight: '600' }}>{'Start'}</Text>
          </TouchableOpacity>
          {/* <Button label={'Start'} type={ButtonType.Dark} onPress={next} /> */}
        </View>
      </View>
    </>
  )
}
