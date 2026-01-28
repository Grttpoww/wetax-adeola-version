import { Theme } from '../theme/theme'
import { StyleProp, TextStyle, ViewStyle, ImageStyle } from 'react-native'

export const createGetStyle = <C extends keyof Theme>(
  theme: Theme,
  componentKey: C,
) => (override?: Partial<Theme[C]>) => <K extends keyof Theme[C]>(
  elementKey: K,
): Array<Theme[C][K]> => {
  return ([
    ...((theme[componentKey][elementKey] as unknown) as Array<unknown>),
    override && override[elementKey] ? override[elementKey] : {},
  ] as unknown) as Array<Theme[C][K]>
}

export const combineStyles = <
  T extends ViewStyle | TextStyle | ImageStyle,
  U extends {
    [k: string]:
      | StyleProp<ViewStyle>
      | StyleProp<TextStyle>
      | StyleProp<ImageStyle>
  }
>(
  s1: Array<StyleProp<T>>,
  key: keyof U,
  s2: U = {} as any,
) => [...s1, s2[key]]

export const squashStyles = (a: Array<any>): any =>
  a.reduce(
    (obj, s) => ({
      ...obj,
      ...s,
    }),
    {} as any,
  )
