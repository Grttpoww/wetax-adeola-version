import * as React from 'react'
import { StyleProp, ViewStyle, ImageStyle, TextStyle, TouchableOpacityProps } from 'react-native'

export type ButtonStyle = {
  background: StyleProp<ViewStyle>
  label: StyleProp<TextStyle>
  loadingIcon: StyleProp<TextStyle>
}

type InputStyle = {
  wrapper: StyleProp<ViewStyle>
  label: StyleProp<TextStyle>
  description: StyleProp<TextStyle>
  input: StyleProp<TextStyle>
  background: StyleProp<ViewStyle>
  inputWrapper: StyleProp<ViewStyle>
}

type ToastStyle = {
  container: StyleProp<ViewStyle>
  text: StyleProp<TextStyle>
}

export type Theme = {
  groupSettings: {
    content: StyleProp<ViewStyle>
  }
  linkSwitch: {
    wrapper: StyleProp<ViewStyle>
    switch: StyleProp<ViewStyle>
    label: StyleProp<TextStyle>
    linkText: StyleProp<TextStyle>
  }
  appLoading: {
    wrapper: StyleProp<ViewStyle>
    messageWrapper: StyleProp<ViewStyle>
    messageText: StyleProp<TextStyle>
  }
  bottomModal: {
    sheet: StyleProp<ViewStyle>
  }
  modalHeader: {
    wrapper: StyleProp<ViewStyle>
    slideBarWrapper: StyleProp<ViewStyle>
    slideBar: StyleProp<ViewStyle>
    topHeader: StyleProp<ViewStyle>
    inlineTitle: StyleProp<TextStyle>
    blockTitle: StyleProp<TextStyle>
    closeButton: StyleProp<TouchableOpacityProps['style']>
    close: Partial<{ color: string; backgroundColor: string }>
  }
  search: {
    wrapper: StyleProp<ViewStyle>
    input: Partial<InputStyle>
    icon: StyleProp<TextStyle>
  }
  avatar: {
    wrapper: StyleProp<ViewStyle>
    initials: StyleProp<TextStyle>
    image: StyleProp<ImageStyle>
  }
  itemSwiper: {
    wrapper: StyleProp<ViewStyle>
  }
  commonButton: ButtonStyle
  lightButton: ButtonStyle
  lightChromelessButton: ButtonStyle
  darkButton: ButtonStyle
  darkChromelessButton: ButtonStyle
  input: InputStyle
  phoneInput: {
    input: Partial<InputStyle>
    flag: StyleProp<ViewStyle>
    countryCode: StyleProp<TextStyle>
  }
  form: {
    rowWrapper: StyleProp<ViewStyle>
    groupTitle: StyleProp<TextStyle>
    groupWrapper: StyleProp<ViewStyle>
    sectionTitle: StyleProp<TextStyle>
    sectionWrapper: StyleProp<ViewStyle>
    wrapper: StyleProp<ViewStyle>
    inputWrapper: StyleProp<ViewStyle>
    content: StyleProp<ViewStyle>
    submitButton: Partial<ButtonStyle>
    buttonContainer: StyleProp<ViewStyle>
  }
  iconButton: {
    wrapper: StyleProp<ViewStyle>
    icon: ViewStyle
  }
  checkbox: {
    wrapper: StyleProp<ViewStyle>
    label: StyleProp<TextStyle>
    sublabel: StyleProp<TextStyle>
  }
  checkboxActive: {
    wrapper: StyleProp<ViewStyle>
    icon: StyleProp<TextStyle>
  }
  checkboxInactive: {
    wrapper: StyleProp<ViewStyle>
    icon: StyleProp<TextStyle>
  }
  select: {
    wrapper: StyleProp<ViewStyle>
    label: StyleProp<TextStyle>
    button: StyleProp<ViewStyle>
    buttonLabel: StyleProp<TextStyle>
    icon: StyleProp<ViewStyle>
  }
  verification: {
    outerWrapper: StyleProp<ViewStyle>
    inputsWrapper: StyleProp<ViewStyle>
    input: StyleProp<TextStyle>
    value: StyleProp<TextStyle>
  }
  headerStyle: {
    headerStyle: StyleProp<ViewStyle>
    headerRightContainerStyle: StyleProp<ViewStyle>
    headerLeftContainerStyle: StyleProp<ViewStyle>
    headerTitleStyle: StyleProp<TextStyle>
    headerBackTitleStyle: StyleProp<TextStyle>
  }
  toastInfo: ToastStyle
  toastFailure: ToastStyle
  toastSuccess: ToastStyle
  toast: {
    container: StyleProp<ViewStyle>
    text: StyleProp<TextStyle>
  }
  floatingButton: {
    outerWrapper: StyleProp<ViewStyle>
    innerWrapper: StyleProp<ViewStyle>
    icon: StyleProp<ViewStyle>
  }
  modal: {
    modal: StyleProp<ViewStyle>
    header: StyleProp<ViewStyle>
    title: StyleProp<TextStyle>
    closeIcon: StyleProp<TextStyle>
  }
  settings: {
    wrapper: StyleProp<ViewStyle>
    bottomView: StyleProp<ViewStyle>
  }
  settingsGroup: {
    group: StyleProp<ViewStyle>
    groupTitle: StyleProp<TextStyle>
    settingsGroup: StyleProp<ViewStyle>
  }
  settingsItem: {
    itemOuter: StyleProp<ViewStyle>
    itemInner: StyleProp<ViewStyle>
    itemIcon: StyleProp<TextStyle>
    itemLabel: StyleProp<TextStyle>
    rightLabel: StyleProp<TextStyle>
    notificationBubble: StyleProp<ViewStyle>
    notificationText: StyleProp<TextStyle>
    chevron: StyleProp<ViewStyle>
    editIcon: StyleProp<ViewStyle>
    switch: StyleProp<ViewStyle>
    optionsWrapper: StyleProp<ViewStyle>
    optionItem: StyleProp<ViewStyle>
    optionLabel: StyleProp<TextStyle>
    activeOptionItem: StyleProp<ViewStyle>
  }
  addContact: {
    label: TextStyle
    wrapper: ViewStyle
    itemWrapper: ViewStyle
    itemName: TextStyle
    itemNumber: TextStyle
    phoneInput: Partial<
      InputStyle & {
        flag: StyleProp<ViewStyle>
      }
    >
    checkIconStyle: TextStyle
    itemFlag: TextStyle
    addManualButton: Partial<{
      wrapper: StyleProp<ViewStyle>
      icon: ViewStyle
    }>
  }
}

const defaultInputStyle: InputStyle = {
  wrapper: {},
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 1,
    marginBottom: 4,
  },
  description: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 42,
  },
  input: {
    fontWeight: '600',
    fontSize: 18,
    paddingLeft: 16,
    borderRadius: 4,
    color: 'white',
  },
  background: {
    backgroundColor: 'white',
  },
}

const defaultTheme: Theme = {
  groupSettings: {
    content: {},
  },
  linkSwitch: {
    wrapper: {},
    switch: {},
    label: {},
    linkText: {},
  },
  appLoading: {
    wrapper: {},
    messageWrapper: {},
    messageText: {},
  },
  bottomModal: {
    sheet: {},
  },
  modalHeader: {
    wrapper: {},
    slideBarWrapper: {},
    slideBar: {},
    topHeader: {},
    inlineTitle: {},
    blockTitle: {},
    closeButton: {},
    close: {},
  },
  addContact: {
    checkIconStyle: {},
    phoneInput: {},
    addManualButton: {},
    wrapper: {},
    label: {},
    itemWrapper: {},
    itemName: {},
    itemNumber: {},
    itemFlag: {},
  },

  search: {
    wrapper: {},
    icon: {},
    input: defaultInputStyle,
  },
  itemSwiper: {
    wrapper: {},
  },
  verification: {
    outerWrapper: {},
    inputsWrapper: {},
    input: {},
    value: {},
  },
  headerStyle: {
    headerStyle: {},
    headerRightContainerStyle: {},
    headerLeftContainerStyle: {},
    headerTitleStyle: {},
    headerBackTitleStyle: {},
  },
  checkbox: {
    wrapper: {},
    label: {},
    sublabel: {},
  },
  checkboxActive: {
    wrapper: {},
    icon: {},
  },
  checkboxInactive: {
    wrapper: {},
    icon: {},
  },
  avatar: {
    wrapper: {},
    initials: {},
    image: {},
  },
  commonButton: {
    background: {
      paddingLeft: 24,
      paddingRight: 24,
      height: 42,
      borderRadius: 21,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
    },
    loadingIcon: {},
  },
  lightChromelessButton: {
    background: {},
    label: {},
    loadingIcon: {},
  },
  lightButton: {
    background: {},
    label: {},
    loadingIcon: {},
  },
  darkChromelessButton: {
    background: {},
    label: {},
    loadingIcon: {},
  },
  darkButton: {
    background: {},
    label: {},
    loadingIcon: {},
  },
  phoneInput: {
    input: defaultInputStyle,
    countryCode: {},
    flag: {},
  },
  input: defaultInputStyle,
  form: {
    inputWrapper: {},
    rowWrapper: {},
    groupTitle: {},
    groupWrapper: {},
    sectionTitle: {},
    sectionWrapper: {},
    wrapper: {},
    content: {},
    submitButton: {},
    buttonContainer: {},
  },
  iconButton: {
    wrapper: {},
    icon: {},
  },
  select: {
    wrapper: {},
    label: {},
    button: {},
    buttonLabel: {},
    icon: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  },
  toastInfo: {
    container: {},
    text: {},
  },
  toastFailure: {
    container: {},
    text: {},
  },
  toastSuccess: {
    container: {},
    text: {},
  },
  toast: {
    container: {},
    text: {},
  },
  floatingButton: {
    outerWrapper: {},
    innerWrapper: {},
    icon: {},
  },
  modal: {
    modal: {},
    header: {},
    title: {},
    closeIcon: {},
  },
  settings: {
    wrapper: {},

    bottomView: {},
  },
  settingsGroup: {
    group: {},
    groupTitle: {},
    settingsGroup: {},
  },
  settingsItem: {
    itemOuter: {},
    itemInner: {},
    itemIcon: {},
    itemLabel: {},
    rightLabel: {},
    activeOptionItem: {},
    notificationBubble: {},
    notificationText: {},
    chevron: {},
    editIcon: {},
    switch: {},
    optionsWrapper: {},
    optionItem: {},
    optionLabel: {},
  },
}

export type AppTheme = { [k in keyof Theme]?: Partial<Theme[k]> }

let ThemeVal = defaultTheme
let ThemeContext = React.createContext(defaultTheme)

export const configureTheme = (userTheme: AppTheme) => {
  ThemeVal = Object.keys(defaultTheme).reduce(
    (acc1, k1) => ({
      ...acc1,
      [k1]: Object.keys((defaultTheme as any)[k1]).reduce(
        (acc2, k2) => ({
          ...acc2,
          [k2]: [
            ...[(defaultTheme as any)[k1][k2]],
            ...((userTheme as any)[k1] && (userTheme as any)[k1][k2]
              ? [(userTheme as any)[k1][k2]]
              : []),
          ],
        }),
        {},
      ),
    }),
    {},
  ) as Theme

  ThemeContext = React.createContext(ThemeVal)

  return ThemeContext
}

export const getThemeContext = () => ThemeContext
export const getTheme = () => ThemeVal
