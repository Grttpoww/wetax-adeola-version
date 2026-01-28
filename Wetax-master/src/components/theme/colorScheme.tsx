import React, { useContext, ReactNode } from 'react'
import { Appearance } from 'react-native'

export const useColorScheme = (): 'light' | 'dark' => {
  const colorScheme = useContext(ColorScheme)
  // return 'light'
  if (!colorScheme) {
    throw new Error(`Color Scheme not found`)
  }

  if (colorScheme === 'dark') {
    return 'dark'
  }

  return 'light'
}

const ColorScheme = React.createContext<'light' | 'dark'>('light')
ColorScheme.displayName = 'ColorScheme'

export const ColorSchemeProvider = (props: {
  children: ReactNode
  fixedValue?: 'light' | 'dark'
}) => {
  const defaultScheme = Appearance.getColorScheme() as 'light' | 'dark'

  const [colorScheme, setColorScheme] = React.useState(defaultScheme)

  // React.useEffect(() => {

  // }, [])

  let subscription = Appearance.addChangeListener(({ colorScheme }) => {
    // console.log('onChange: ', colorScheme)
    setColorScheme(colorScheme as any)
  })
  // console.log(colorScheme)

  return (
    <ColorScheme.Provider
      value={
        props.fixedValue
          ? props.fixedValue
          : colorScheme === 'dark'
          ? 'dark'
          : 'light'
      }
    >
      {props.children}
    </ColorScheme.Provider>
  )
}
