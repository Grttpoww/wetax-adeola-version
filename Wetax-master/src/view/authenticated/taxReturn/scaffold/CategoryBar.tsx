import { TouchableOpacity, View } from 'react-native'
import { useTheme } from 'styled-components'

import { useScreenManager } from '../context/ScreenManager.context'
import { ScreenCategoryEnum, ScreenEnum } from '../enums'
import {
  mapCategoryToCategoryOverviewScreen,
  mapScreenCategoryToIcon,
  mapScreenCategoryToLabel,
} from '../constants'
import { useTaxReturn } from '../../../../context/TaxReturn.context'

export const CategoryBar = () => {
  const theme = useTheme()
  const { category, setScreen, screen } = useScreenManager()
  const { taxReturn } = useTaxReturn()

  return (
    <View
      style={{
        width: '100%',
        height: 40,
        flexDirection: 'row',
        backgroundColor: theme.colors.PRIMARY,
        borderWidth: 0,
        marginBottom: 10,
        marginTop: 20,
      }}
    >
      {Object.entries(mapScreenCategoryToLabel).map(([key, value], k) => (
        <TouchableOpacity
          key={k}
          onPress={() => {
            const categoryKey = key as ScreenCategoryEnum
            let targetScreen = mapCategoryToCategoryOverviewScreen[categoryKey]

            // Special case: If clicking Einkommen and geldVerdient array is empty, go to Einkuenfte intro
            if (categoryKey === ScreenCategoryEnum.Einkommen && targetScreen === ScreenEnum.GeldVerdientOverview) {
              const geldVerdientData = taxReturn.data.geldVerdient?.data || []
              if (geldVerdientData.length === 0) {
                targetScreen = ScreenEnum.Einkuenfte
              }
            }

            setScreen(targetScreen)
          }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: category === key ? '#fff' : 'rgb(26,36,146)',
            borderColor: category === key ? '#fff' : 'rgb(26,36,146)',
            borderRadius: 10,
            marginHorizontal: 10,
            // width: '15%',
          }}
        >
          {mapScreenCategoryToIcon[key as ScreenCategoryEnum]({
            size: 16,
            color: category === key ? 'rgb(26,36,146)' : 'rgba(255,255,255,0.3)',
          })}
        </TouchableOpacity>
      ))}
    </View>
  )
}
