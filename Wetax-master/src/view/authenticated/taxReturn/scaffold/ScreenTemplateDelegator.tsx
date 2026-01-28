import { Animated, Text, View } from 'react-native'
import { ScreenManager, useScreenManager } from '../context/ScreenManager.context'
import { ScreenCategoryEnum, ScreenTypeEnum } from '../enums'
import { ArrayOverviewTemplate } from '../screenTemplates/ArrayOverview.template'
import { CategoryTemplate } from '../screenTemplates/Category.template'
import { FormArrayTemplate } from '../screenTemplates/FormArray.template'
import { FormObjTemplate } from '../screenTemplates/FormObj.template'
import { GeneratePdfTemplate } from '../screenTemplates/GeneratePdf.template'
import {
  ScanOrUploadTemplateArray,
  ScanOrUploadTemplateObj,
  ScanOrUploadTemplateArrayBankkonto,
} from '../screenTemplates/ScanOrUpload.template'
import { YesNoTemplate } from '../screenTemplates/YesNo.template'
import { useEffect, useMemo, useRef } from 'react'
import { ArrayManager } from '../context/ArrayManager.context'
import { TemplateScaffold } from './TemplateScaffold'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { RejectionScreen } from './RejectionScreen'
import { mapScreenEnumToCategory } from '../constants'

const AnimatedViewWrapper = ({ children }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [])

  return (
    <Animated.View style={{ flex: 1, width: '100%', opacity: animatedValue }}>{children}</Animated.View>
  )
}

const _ScreenTemplateDelegator = ({ navigation }: any) => {
  const { screen } = useScreenManager()

  const renderContent = () => {
    if (screen.type === ScreenTypeEnum.ArrayForm) {
      return <FormArrayTemplate screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.ObjForm) {
      return <FormObjTemplate screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.YesNo) {
      return <YesNoTemplate screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.ArrayOverview) {
      return <ArrayOverviewTemplate screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.GeneratePdf) {
      return <GeneratePdfTemplate />
    }

    if (screen.type === ScreenTypeEnum.CategoryOverview) {
      return <CategoryTemplate screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.ScanOrUploadObj) {
      return <ScanOrUploadTemplateObj screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.ScanOrUploadArray) {
      return <ScanOrUploadTemplateArray screen={screen} />
    }

    if (screen.type === ScreenTypeEnum.ScanOrUploadArrayBankkonto) {
      return <ScanOrUploadTemplateArrayBankkonto screen={screen} />
    }

    return (
      <View>
        <Text>Not found</Text>
      </View>
    )
  }

  return <AnimatedViewWrapper key={screen.name}>{renderContent()}</AnimatedViewWrapper>
}

export const ScreenTemplateDelegator = ({ navigation }: any) => {
  const { taxReturn } = useTaxReturn()

  const isRejected = useMemo(() => {

    // if (taxReturn.data.inZuerich.start === false) {
    //   console.log('🚫 REJECTED: inZuerich.start === false:', taxReturn.data.inZuerich.start)
    //   return true
    // }

    // if (taxReturn.data.verheiratet.start === true) {
    //   console.log('🚫 REJECTED: verheiratet.start === true:', taxReturn.data.verheiratet.start)
    //   return true
    // }

    // if (taxReturn.data.hatKinder.start === true) {
    //   console.log('🚫 REJECTED: hatKinder.start === true:', taxReturn.data.hatKinder.start)
    //   return true
    // }

    // if (taxReturn.data.einkuenfteSozialversicherung.start === true) {
    //   console.log('🚫 REJECTED: einkuenfteSozialversicherung.start === true:', taxReturn.data.einkuenfteSozialversicherung.start)
    //   return true
    // }

    // if (taxReturn.data.erwerbsausfallentschaedigung.start === true) {
    //   console.log('🚫 REJECTED: erwerbsausfallentschaedigung.start === true:', taxReturn.data.erwerbsausfallentschaedigung.start)
    //   return true
    // }

    // if (taxReturn.data.lebensOderRentenversicherung.start === true) {
    //   console.log('🚫 REJECTED: lebensOderRentenversicherung.start === true:', taxReturn.data.lebensOderRentenversicherung.start)
    //   return true
    // }

    // if (taxReturn.data.geschaeftsOderKorporationsanteile.start === true) {
    //   console.log('🚫 REJECTED: geschaeftsOderKorporationsanteile.start === true:', taxReturn.data.geschaeftsOderKorporationsanteile.start)
    //   return true
    // }

    // if (taxReturn.data.verschuldet.start === true) {
    //   console.log('🚫 REJECTED: verschuldet.start === true:', taxReturn.data.verschuldet.start)
    //   return true
    // }
    return false
  }, [taxReturn])

  return (
    <ScreenManager>
      <ArrayManager>
        <TemplateScaffold navigation={navigation}>
          <ScreenContentWrapper isRejected={isRejected} navigation={navigation} />
        </TemplateScaffold>
      </ArrayManager>
    </ScreenManager>
  )
}

const ScreenContentWrapper = ({ isRejected, navigation }: { isRejected: boolean; navigation: any }) => {
  const { screen } = useScreenManager()
  const currentScreenCategory = mapScreenEnumToCategory[screen.name]

  // Only show rejection screen if:
  // 1. User is rejected based on qualification answers AND
  // 2. User is trying to access categories beyond qualification (income, deductions, assets)
  // Allow access to qualification screens and overview screens (personal details, bank details)
  const shouldShowRejection = isRejected && (
    currentScreenCategory === ScreenCategoryEnum.Einkommen ||
    currentScreenCategory === ScreenCategoryEnum.Abzuege ||
    currentScreenCategory === ScreenCategoryEnum.Vermoegen
  )

  if (shouldShowRejection) {
    return <RejectionScreen navigation={navigation} />
  }
  return <_ScreenTemplateDelegator navigation={navigation} />
}
