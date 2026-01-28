import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import AnimatedNumbers from 'react-native-animated-numbers'
import { useScreenManager } from '../context/ScreenManager.context'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { UserScreenEnum } from '../../user/enums'
import { TaxReturnOverview } from '../TaxReturnOverview'
import { TaxReturnScreen } from '../enums'

export const TopBar = ({ navigation }: any) => {
  const { screen } = useScreenManager()
  const { taxAmount } = useTaxReturn()

  const [value, setValue] = useState(123)

  useEffect(() => {
    setValue((v) => v + 100 * Math.random())
  }, [screen])

  return (
    <View
      style={{
        backgroundColor: 'rgb(26,36,146)',
        width: '100%',
        height: 40,
        paddingBottom: 8,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity
        style={{
          gap: 4,
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
        onPress={() => {
          navigation.navigate(TaxReturnScreen.Overview)
        }}
      >
        <AntDesign name="left" size={14} color="white" />
        <Text
          style={{
            marginTop: -2,
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          Übersicht
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            CHF
          </Text>
          <AnimatedNumbers
            includeComma
            animateToNumber={taxAmount.totalTaxes}
            fontStyle={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}
          />
        </View>
      </TouchableOpacity>
    </View>
  )
}
