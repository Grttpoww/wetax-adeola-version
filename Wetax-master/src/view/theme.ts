import { configureTheme } from '../components/theme'
import { ColorSchemes } from '../shared/colors'
import 'styled-components'

export const configureAppThemeContext = (colors: (typeof ColorSchemes)['light']) =>
  configureTheme({
    groupSettings: {
      content: {
        backgroundColor: colors.BACKGROUND,
      },
    },
    appLoading: {
      wrapper: {},
      messageWrapper: {},
      messageText: {},
    },
    modalHeader: {
      inlineTitle: {
        fontFamily: 'Poppins700',
        color: colors.TEXT,
      },
      blockTitle: {
        fontFamily: 'Poppins700',
        color: colors.TEXT,
      },
      slideBar: {
        backgroundColor: colors.FADED_GRAY_TEXT,
      },
      close: {
        color: colors.GRAY_TEXT,
        backgroundColor: colors.ICON_INACTIVE_LIGHT,
      },
    },
    bottomModal: {
      sheet: {
        paddingTop: 0,
        paddingLeft: 22,
        paddingRight: 22,
        paddingBottom: 22,
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.BACKGROUND_MODAL,
      },
    },
    headerStyle: {
      headerStyle: {
        backgroundColor: colors.BACKGROUND,
        height: 96,
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerRightContainerStyle: {
        paddingRight: 16,
      },
      headerLeftContainerStyle: {
        paddingLeft: 16,
      },
      headerTitleStyle: {
        fontSize: 16,
        fontFamily: 'Poppins700',
        color: colors.TEXT,
      },
      headerBackTitleStyle: {
        color: colors.PRIMARY,
        fontFamily: 'Poppins500',
        fontSize: 15,
      },
    },
    verification: {
      inputsWrapper: {
        borderColor: colors.TEXT,
      },
      input: {
        color: colors.TEXT,
      },
      value: {},
    },
    toastSuccess: {
      container: {
        backgroundColor: colors.GREEN,
      },
    },
    toastFailure: {
      container: {
        backgroundColor: colors.RED,
      },
    },
    modal: {
      modal: {},
    },
    commonButton: {
      background: {
        borderRadius: 2,
        height: 56,
        backgroundColor: colors.PRIMARY,
      },
      label: {
        fontFamily: 'Poppins600',
        fontSize: 16,
        color: 'white',
      },
    },
    toast: {
      container: {
        width: '100%',
        height: 96,
        paddingTop: 32,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
      },
      text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
      },
    },
    checkbox: {
      wrapper: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
      },

      sublabel: {},
      label: {
        color: 'white',
      },
    },
    checkboxActive: {
      wrapper: {
        backgroundColor: 'white',
      },
      icon: {},
    },
    checkboxInactive: {
      wrapper: {
        backgroundColor: colors.ITEM_CONTAINER,
      },
    },
    lightButton: {
      background: {
        backgroundColor: 'white',
        width: '100%',
      },
      label: {
        color: colors.PRIMARY,
      },
      loadingIcon: {
        marginLeft: 8,
        color: 'white',
      },
    },
    darkButton: {
      background: {
        backgroundColor: colors.PRIMARY,
      },
      label: {
        color: 'white',
      },
      loadingIcon: {
        marginLeft: 8,
        color: 'white',
      },
    },
    select: {
      wrapper: {
        borderRadius: 2,
        marginBottom: 16,
      },
      label: {
        marginLeft: -8,
        fontFamily: 'Poppins500',
        fontSize: 14,
        color: 'rgb(100,100,100)',
      },
      button: {
        borderWidth: 1,
        borderColor: colors.BORDER_GRAY,
        backgroundColor: 'white',
        borderRadius: 2,
        height: 56,
        paddingLeft: 16,
        paddingRight: 32,
      },
      icon: {
        top: 16,
        color: colors.FADED_GRAY_TEXT,
      } as any,
      buttonLabel: {
        fontSize: 16,
        fontFamily: 'Poppins500',
        color: colors.TEXT,
      } as any,
    },
    search: {
      wrapper: {
        backgroundColor: colors.ITEM_CONTAINER,
        height: 56,
        flexShrink: 0,
        borderRadius: 12,
        marginBottom: 16,
      },
      input: {
        background: {
          height: 56,
        },

        input: {
          borderWidth: 1,
          borderColor: colors.PRIMARY,
          borderRadius: 2,
          height: 56,
          fontFamily: 'Poppins500',
          fontSize: 18,
          paddingLeft: 24,
          paddingRight: 32,
        },
        inputWrapper: {
          height: 56,
        },
      } as any,
      icon: {
        top: 16,
        height: 24,
        width: 24,
        position: 'absolute',
        color: colors.FADED_GRAY_TEXT,
        right: 12,
        zIndex: 2,
      },
    },
    addContact: {
      checkIconStyle: {
        color: colors.GREEN,
      },
      addManualButton: {
        wrapper: {
          backgroundColor: colors.ITEM_CONTAINER,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          width: 56,
          height: 56,
          flexShrink: 0,
          borderColor: colors.BORDER_GRAY,
          borderWidth: 1,
          borderLeftWidth: 0,
        },
        icon: {
          color: colors.PRIMARY,
        } as any,
      },
      wrapper: {
        backgroundColor: colors.BACKGROUND_MODAL,
      },
      label: {
        fontSize: 12,
        marginTop: 16,
        marginBottom: 6,
        fontFamily: 'Poppins500',
        color: colors.TEXT,
      },
      itemWrapper: {
        backgroundColor: colors.ITEM_CONTAINER,
        borderRadius: 12,
        marginBottom: 8,
        height: 60,
      },
      itemName: {
        fontSize: 14,
        fontFamily: 'Poppins500',
        color: colors.TEXT,
      },
      itemNumber: {
        fontSize: 13,
        fontFamily: 'Poppins400',
        color: colors.TEXT,
      },
    },
    linkSwitch: {
      wrapper: {
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 32,
        flexDirection: 'row',
        width: '100%',
      },
      label: {
        color: colors.TEXT,
        fontFamily: 'Poppins500',
        fontSize: 14,
        marginLeft: 16,
      },
      linkText: {
        color: colors.TEXT,
        fontFamily: 'Poppins500',
        textDecorationLine: 'underline',
        fontSize: 14,
        marginLeft: 6,
      },
    },
    settingsGroup: {
      group: {},
      groupTitle: {
        // fontFamily: 'Poppins500',
        // fontSize: 16,
        // color: colors.TEXT,
      },
      settingsGroup: {
        borderRadius: 12,
        overflow: 'hidden',
        paddingLeft: 18,
        paddingRight: 18,
        backgroundColor: colors.ITEM_CONTAINER,
      },
    },
    settingsItem: {
      rightLabel: {
        fontFamily: 'Poppins600',
        fontSize: 12,
        color: colors.TEXT,
      },
      itemOuter: {
        height: 54,
        backgroundColor: colors.ITEM_CONTAINER,
        borderColor: colors.DIVIDER,
      },
      chevron: {
        color: colors.FADED_GRAY_TEXT,
        marginRight: -12,
      } as any,
      itemInner: {
        height: 54,
      },
      notificationBubble: {
        backgroundColor: colors.PRIMARY,
      },
      activeOptionItem: {},
      notificationText: {
        color: 'white',
      },
      itemLabel: {
        fontFamily: 'Poppins500',
        fontSize: 14,
        marginLeft: 12,
        color: colors.TEXT,
      },
      itemIcon: {
        color: colors.TEXT,
        marginLeft: -8,
      },
    },
    settings: {},
    darkChromelessButton: {
      label: {
        color: colors.PRIMARY,
      },
      background: {
        borderColor: colors.PRIMARY,
        borderWidth: 1,
        backgroundColor: 'transparent',
      },
    },
    lightChromelessButton: {
      label: {
        color: 'white',
      },
      background: {
        borderColor: 'white',
        borderWidth: 1,
        backgroundColor: 'transparent',
      },
    },
    form: {
      wrapper: {},
      buttonContainer: {
        width: '100%',
        paddingBottom: 32,
        paddingTop: 16,
      },
      submitButton: {
        background: {
          width: '100%',
        },
      },
      sectionTitle: {
        fontFamily: 'Poppins700',
        fontSize: 30,
        fontWeight: '800',
        color: '#1D2DBA',
      },
      groupTitle: {
        fontFamily: 'Poppins700',
        fontSize: 19,
        color: colors.TEXT,
        marginTop: 0,
        marginBottom: 12,
      },
      inputWrapper: {
        minHeight: 48,
        flexShrink: 0,
      },
      rowWrapper: {
        flexShrink: 0,
      },
      sectionWrapper: {
        flexShrink: 0,
      },
      groupWrapper: {
        flexShrink: 0,
      },
    },
    phoneInput: {
      flag: {
        paddingRight: 0,
      },
      countryCode: {
        fontSize: 18,
        fontFamily: 'Poppins500',
        color: colors.TEXT,
      },
    },
    input: {
      wrapper: {
        flexShrink: 0,
        marginBottom: 16,
      },
      background: {
        backgroundColor: colors.ITEM_CONTAINER,
        height: 56,
        borderWidth: 1,
        borderColor: colors.BORDER_GRAY,
        borderRadius: 2,
      },
      label: {
        fontFamily: 'Poppins500',
        fontSize: 14,
        color: 'rgb(100,100,100)',
        marginBottom: 8,
      },
      description: {
        fontFamily: 'Poppins500',
        fontSize: 12,
        color: colors.TEXT,
        marginTop: -6,
      },
      input: {
        height: 56,
        fontFamily: 'Poppins500',
        fontSize: 18,
        color: colors.TEXT,
        flexShrink: 0,
        flex: 1,
      },
      inputWrapper: {
        flexDirection: 'row',
        height: 56,
        flexShrink: 0,
      },
    },
  })
