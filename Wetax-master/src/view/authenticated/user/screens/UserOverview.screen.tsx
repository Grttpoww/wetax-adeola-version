import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useUser } from '../../../../context/User.context'
import { Button, ButtonType } from '../../../../components/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService, TaxReturn, UserT } from '../../../../openapi'
import { useOptionalTaxReturn } from '../../../../context/TaxReturn.context'
import { useTheme } from 'styled-components'
import { Entypo, Octicons } from '@expo/vector-icons'
import { AuthenticatedNavigatorEnum } from '../../enums'
import React, { useState } from 'react'
import SubscriptionModal from '../../../../components/SubscriptionModal'
import { useFocusEffect } from '@react-navigation/native'
import { TaxReturnScreen } from '../../taxReturn/enums'
import RNPickerSelect from 'react-native-picker-select'

export const UserOverview = ({ navigation }: any) => {
  const theme = useTheme()
  const { setTaxReturnId } = useOptionalTaxReturn()
  const { user } = useUser()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  let subscribed = false

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      if (!subscribed) {
        setShowSubscriptionModal(true)
      } else {
        setShowSubscriptionModal(false)
      }
    }, []),
  )

  const queryClient = useQueryClient()

  const createReturn = useMutation({
    mutationFn: ApiService.createTaxReturn,
    onSuccess: (v) => {
      queryClient.setQueryData<UserT | undefined>(['user'], (u) =>
        u ? { ...u, returns: [...u.returns, v] } : undefined,
      )
      queryClient.setQueryData<TaxReturn | undefined>(['taxReturn', v._id], v)
      return v
    },
  })

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }))

  return (
    <ScrollView
      contentContainerStyle={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        gap: 16,
        width: '100%',
      }}
    >
      {/* <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelect={(subscription: any) => {
          console.log('User selected subscription:', subscription)
          // Optionally send this to your backend or store in state
        }}
      /> */}
      {user.returns.length === 0 && (
        <>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Willkommen
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 16, opacity: 0.8 }}>
            Bitte benutzen Sie den untenstehenden Knopf, um eine neue Steuererklärung für das Jahr{' '}
            {new Date().getFullYear()} zu beginnen.
          </Text>
        </>
      )}
      {user.returns.map((r) => (
        <TouchableOpacity
          key={r._id}
          onPress={() => {
            console.log('Navigating to TaxReturn Overview for ID:', r._id)
            setTaxReturnId(r._id)
            navigation.navigate(AuthenticatedNavigatorEnum.TaxReturn, {
              screen: TaxReturnScreen.Overview,
            })
          }}
          style={{
            width: '100%',
            backgroundColor: theme.colors.PRIMARY,
            // padding: 18,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // borderRadius: 10,
            height: 50,
            borderRadius: 30,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Entypo name="calendar" size={18} color="#fff" />
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                marginLeft: 15,
              }}
            >
              {r.year}
            </Text>
          </View>

          <Octicons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      ))}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Jahr auswählen</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedYear(value)}
          items={yearOptions}
          value={selectedYear}
          style={{
            inputIOS: {
              fontSize: 16,
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: '#1d2dba',
              borderRadius: 8,
              color: 'black',
              paddingRight: 30,
              backgroundColor: '#fff',
            },
            inputAndroid: {
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#1d2dba',
              borderRadius: 8,
              color: 'black',
              backgroundColor: '#fff',
            },
          }}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          createReturn
            .mutateAsync({
              year: selectedYear,
            })
            .then((v) => {
              setTaxReturnId(v._id)
              console.log('TaxReturn created:', v)
            })
            .catch((err) => {
              console.log('Error creating TaxReturn:', err)
            })
        }}
        activeOpacity={0.7}
        style={{
          height: 50,
          backgroundColor: '#1d2dba',
          borderRadius: 30,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 15, color: '#fff', fontWeight: '600' }}>
          {'Neue Steuererklärung starten'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
