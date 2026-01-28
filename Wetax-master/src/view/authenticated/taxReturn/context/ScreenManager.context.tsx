import groupBy from 'lodash.groupby'
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { TaxReturnData } from '../../../../openapi'
import { mapScreenEnumToCategory, mapScreenEnumToSubcategory, mapSubcategoryToLabel } from '../constants'
import { ScreenCategoryEnum, ScreenEnum, ScreenSubcategoryEnum, ScreenTypeEnum } from '../enums'
import { DEFAULT_SCREEN, SCREENS } from '../screens'
import { ScreenT } from '../types'

type ScreenManagerContextT = {
  screen: ScreenT<any, any>
  setScreen: (v: ScreenEnum) => void
  category: ScreenCategoryEnum
  subcategory: ScreenSubcategoryEnum | undefined
  setCategory: (v: ScreenCategoryEnum) => void
  goBack: () => void
  next: () => void
  previous: () => void
  awaitNext: (screen?: ScreenEnum) => void
  categoryScreens: Array<ScreenT<any, any>>
  segments: Array<{
    key: string
    name: string
    screens: Array<ScreenEnum>
    isDone: boolean
  }>
}

export const useScreenManager = (): ScreenManagerContextT => {
  const val = useContext(ScreenManagerContext)
  if (!val) {
    throw new Error('Screen manager context not found')
  }

  return val
}

const ScreenManagerContext = createContext<ScreenManagerContextT | undefined>(undefined)

ScreenManagerContext.displayName = 'ScreenManagerContext'

export const ScreenManager = (props: { children: ReactNode }) => {
  const { taxReturn } = useTaxReturn()

  const [_awaitNext, setAwaitNext] = useState(false)
  const [nextScreen, setNextScreen] = useState<ScreenEnum | undefined>(undefined)
  const [undoStack, setUndoStack] = useState<Array<ScreenEnum>>([])
  const [_screen, _setScreen] = useState(DEFAULT_SCREEN.name)

  const categoryScreens = useMemo(() => {
    return SCREENS.filter((s) => {
      if ('hide' in s && s.hide && taxReturn.data) {
        const userDataKey = s.dataKey as keyof TaxReturnData
        return !s.hide(taxReturn.data[userDataKey], taxReturn.data)
      }
      return true
    })
  }, [taxReturn.data])

  const screen = useMemo(() => {
    const s = categoryScreens.find((s) => s.name === _screen)
    if (!s) {
      throw new Error(`Screen not found: ${_screen}`)
    }
    return s
  }, [_screen, categoryScreens])

  const setScreen = useCallback(
    (v: ScreenEnum) => {
      // const screenIndex = undoStack.findIndex((s) => s === v)
      // if (screenIndex !== -1) {
      //   setUndoStack([...undoStack.slice(0, screenIndex + 1)])
      // } else {
      setUndoStack((s) => [...s, _screen])
      // }
      _setScreen(v)
    },
    [_screen],
  )

  const setCategory = useCallback((v: ScreenCategoryEnum) => {}, [])

  const goBack = useCallback(() => {
    const lastScreen = undoStack.pop()

    if (lastScreen) {
      _setScreen(lastScreen)
      setUndoStack([...undoStack])
    }
  }, [undoStack])

  const next = useCallback(() => {
    const currentIndex = categoryScreens.findIndex((s) => s.name === _screen)
    const _nextScreen = nextScreen || categoryScreens[currentIndex + 1]?.name

    if (!_nextScreen) {
      throw new Error('No next screen')
    }

    setScreen(_nextScreen)
  }, [categoryScreens, _screen, nextScreen])

  const previous = useCallback(() => {
    const currentIndex = categoryScreens.findIndex((s) => s.name === _screen)
    const nextScreen = categoryScreens[currentIndex - 1]

    if (!nextScreen) {
      throw new Error('No next screen')
    }

    setScreen(nextScreen.name)
  }, [categoryScreens, _screen])

  const autoNext = useCallback(() => {
    if (_awaitNext) {
      next()
    }
    setNextScreen(undefined)
    setAwaitNext(false)
  }, [_awaitNext, next])

  useEffect(() => {
    autoNext()
  }, [taxReturn])

  const awaitNext = useCallback((v?: ScreenEnum) => {
    setNextScreen(v)
    setAwaitNext(true)
  }, [])

  const category = mapScreenEnumToCategory[screen.name]

  const segments = useMemo(() => {
    const grouped = groupBy(
      categoryScreens.filter(
        (s, i) =>
          mapScreenEnumToCategory[s.name] === category && s.type !== ScreenTypeEnum.CategoryOverview,
      ),
      (i) => mapScreenEnumToSubcategory[i.name] || i.name,
    )

    return Object.entries(grouped).map(([key, value]) => {
      const isNotDone = value.some((s) => {
        if ('isDone' in s && 'dataKey' in s) {
          const userDataKey = s.dataKey as keyof typeof taxReturn.data
          return !s.isDone(taxReturn.data[userDataKey], taxReturn.data)
        }
        return false
      })

      const name = mapSubcategoryToLabel[key as ScreenSubcategoryEnum] || value[0].title

      return {
        key,
        name,
        screens: value.map((s) => s.name),
        isDone: !isNotDone,
      }
    })
  }, [categoryScreens, taxReturn.data, category])

  return (
    <ScreenManagerContext.Provider
      value={{
        screen,
        setScreen,
        goBack,
        category,
        subcategory: mapScreenEnumToSubcategory[screen.name],
        setCategory,
        segments,
        next,
        previous,
        awaitNext,
        categoryScreens,
      }}
    >
      {props.children}
    </ScreenManagerContext.Provider>
  )
}
