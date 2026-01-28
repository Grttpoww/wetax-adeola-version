import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { Button, ButtonType } from '../../../components/shared'
import { TaxReturnScreen } from './enums'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService, TaxReturn, UserT } from '../../../openapi'
import { useTaxReturn } from '../../../context/TaxReturn.context'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import CustomAlertBox from '../../../components/CustomAlertBox'

export const TaxReturnOverview = ({ navigation }: any) => {
  const { setTaxReturnId, taxReturnId } = useTaxReturn()
  const [showAlert, setShowAlert] = useState(false)

  const queryClient = useQueryClient()

  const archiveTaxReturn = useMutation({
    mutationFn: ApiService.archiveTaxReturn,
    onSuccess: (v, meta) => {
      queryClient.setQueryData<UserT | undefined>(['user'], (u) =>
        u ? { ...u, returns: u.returns.filter((r) => r._id !== meta) } : undefined,
      )
      queryClient.setQueryData<TaxReturn | undefined>(['taxReturn', meta], undefined)

      setTaxReturnId(undefined)

      return v
    },
  })

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        padding: 24,
        gap: 16,
      }}
    >
      <CustomAlertBox
        visible={showAlert}
        title="Löschen bestätigen"
        message="Bist du sicher, dass du die Steuererklärung löschen möchtest?"
        onCancel={() => setShowAlert(false)}
        onConfirm={() => {
          setShowAlert(false)
          // archiveTaxReturn.mutate(taxReturnId)
          setTimeout(() => {
            archiveTaxReturn.mutate(taxReturnId)
          }, 300)
        }}
        cancelText="Nein"
        confirmText="Ja"
        extraConfirmButtonStyle={{ backgroundColor: 'rgba(255,0,0,0.8)' }}
      />
      {/* <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text>Progress</Text>
        <View>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>24%</Text>
        </View>
        
      </View> */}

      <Text style={{ fontSize: 16, marginBottom: 16, opacity: 0.8, fontWeight: '600' }}>
        Diese Steuererklärung ist in Bearbeitung.
      </Text>
      {/* <Button
        label="Bearbeiten"
        type={ButtonType.Dark}
        onPress={() => {
          navigation.navigate(TaxReturnScreen.Flow)
        }}
      /> */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(TaxReturnScreen.Flow)
        }}
        activeOpacity={0.7}
        style={{
          height: 50,
          backgroundColor: '#1D2DBA',
          borderRadius: 30,
          paddingHorizontal: 25,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{'Bearbeiten'}</Text>
        <Feather name="edit" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setShowAlert(true)}
        // onPress={() => {
        //   Alert.alert('Bist du sicher, dass du die Steuererklärung löschen möchtest?', '', [
        //     {
        //       text: 'Nein',
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Ja',
        //       onPress: () => {
        //         archiveTaxReturn.mutate(taxReturnId)
        //       },
        //     },
        //   ])
        // }}
        activeOpacity={0.7}
        style={{
          height: 50,
          backgroundColor: '#fff',
          borderColor: 'rgba(255,0,0,0.5)',
          borderRadius: 30,
          paddingHorizontal: 25,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          borderWidth: 1,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: 'red' }}>{'Löschen'}</Text>
        <MaterialIcons name="delete-forever" size={22} color="red" />
      </TouchableOpacity>

      {/* <Button
        label="Löschen"
        style={{
          background: {
            borderColor: 'rgba(255,0,0,0.5)',
            backgroundColor: 'white',
            borderWidth: 1,
          },
          label: {
            color: 'red',
          },
        }}
        onPress={() => {
          Alert.alert('Bist du sicher, dass du die Steuererklärung löschen möchtest?', '', [
            {
              text: 'Nein',
              style: 'cancel',
            },
            {
              text: 'Ja',
              onPress: () => {
                archiveTaxReturn.mutate(taxReturnId)
              },
            },
          ])
        }}
      /> */}
    </View>
  )
}
