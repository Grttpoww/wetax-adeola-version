import { Entypo } from '@expo/vector-icons'
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { useTheme } from 'styled-components'
import { useScreenManager } from '../context/ScreenManager.context'
import { ScreenTypeEnum } from '../enums'
import { Modal } from 'react-native'
import { useState } from 'react'
import { Button } from '../../../../components/shared'

export const TitleBar = () => {
  const theme = useTheme()
  const { width, height } = useWindowDimensions()

  const [showModal, setShowModal] = useState(false)

  const { screen } = useScreenManager()

  // if (screen.type === ScreenTypeEnum.CategoryOverview) {
  //   return null
  // }

  return (
    <View
      style={{
        height: 48,
        width: '100%',
        backgroundColor: theme.colors.PRIMARY,
        paddingLeft: 8,
        paddingRight: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 0,
      }}
    >
      <Modal transparent visible={showModal}>
        <View
          style={{
            width,
            height,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              width: '100%',
              padding: 24,
              paddingBottom: 48,
              paddingTop: 64,
            }}
          >
            <Text
              style={{
                marginTop: 'auto',
                color: 'white',
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Guidance text
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
              }}
            >
              {screen.helpText!}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              activeOpacity={0.7}
              style={{
                borderWidth: 0,
                backgroundColor: '#fff',
                height: 50,
                borderRadius: 30,
                marginTop: 'auto',
                marginBottom: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>{'Close'}</Text>
            </TouchableOpacity>
            {/* <Button
              label="Close"
              onPress={() => setShowModal(false)}
              style={{
                background: {
                  marginTop: 'auto',
                },
              }}
            /> */}
          </View>
        </View>
      </Modal>
      {/* <TouchableOpacity onPress={goBack}>
        <View>
          <Ionicons name="arrow-back" size={20} color="white" />
        </View>
      </TouchableOpacity> */}
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
          marginLeft: 12,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          {screen.title}
        </Text>
      </View>

      {screen.helpText && (
        <TouchableOpacity
          onPress={() => {
            setShowModal(true)
          }}
          style={{ width: 32, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}
        >
          <Entypo name="help-with-circle" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  )
}
