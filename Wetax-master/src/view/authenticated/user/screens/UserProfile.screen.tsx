import { Alert, ScrollView, Text, View, TouchableOpacity } from 'react-native'
import { useUser } from '../../../../context/User.context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQueryClient } from '@tanstack/react-query'
import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import CustomAlertBox from '../../../../components/CustomAlertBox'
import { useNavigation } from '@react-navigation/native'
import SubscriptionModal from '../../../../components/SubscriptionModal'
import { ApiService } from '../../../../openapi'

export const UserProfile = () => {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const navigation = useNavigation<any>()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const confirmLogout = async () => {
    // Clear all stored data
    await AsyncStorage.removeItem('@token')
    await AsyncStorage.removeItem('@taxReturnId')

    // Clear all query cache
    queryClient.clear()

    // Navigate to login
    navigation.navigate('UnauthenticatedNavigator' as never, { screen: 'Login' } as never)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true)
  }

  const getSubscriptionLabel = (sub: string) => {
    if (sub === 'premium') return 'Premium Plan (30 CHF)'
    if (sub === 'free') return 'Free Plan'
    return null
  }

  const activeSubscription = getSubscriptionLabel('premium')

  const onPressDeleteUserAccount = async () => {
    try {
      const response = await ApiService.deleteAccount()
      if ('success' in response && response.success) {
        setShowDeleteConfirm(false)
        confirmLogout()
      } else {
        console.error('Error deleting account:', 'error' in response ? response.error : 'Unknown error')
      }
    } catch (err) {
      console.error('API error:', err)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 12,
        backgroundColor: '#f9f9f9',
        flexGrow: 1,
      }}
    >
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* AHV Number */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#888' }}>AHV Number</Text>
          <Text
            style={{
              fontSize: 16,
              color: '#333',
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              marginTop: 5,
            }}
          >
            {user?.user?.ahvNummer || '—'}
          </Text>
        </View>

        {/* Phone Number */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#888' }}>Phone Number</Text>
          <Text
            style={{
              fontSize: 16,
              color: '#333',
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              marginTop: 5,
            }}
          >
            {user?.user?.phoneNumber || '—'}
          </Text>
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#888' }}>Email</Text>
          <Text
            style={{
              fontSize: 16,
              color: '#333',
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              marginTop: 5,
            }}
          >
            {user?.user?.email || '—'}
          </Text>
        </View>

        {/* Subscription */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#888' }}>Subscription</Text>
          {activeSubscription ? (
            <Text
              style={{
                fontSize: 16,
                color: '#333',
                backgroundColor: '#d7f8e9',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 12,
                marginTop: 5,
              }}
            >
              {activeSubscription}
            </Text>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#1D2DBA',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginTop: 8,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('SubscriptionScreen')}
              // onPress={() => setShowSubscriptionModal(true)}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Choose Subscription
              </Text>
            </TouchableOpacity>
          )}
        </View> */}

        {/* Logout */}
        <TouchableOpacity
          style={{
            marginTop: 32,
            borderWidth: 1,
            borderColor: 'red',
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            backgroundColor: 'white',
            flexDirection: 'row',
            paddingHorizontal: 25,
            justifyContent: 'space-between',
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'red', fontSize: 16, fontWeight: '600' }}>Ausloggen</Text>
          <MaterialIcons name="logout" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Confirm Dialog */}
      {showLogoutConfirm && (
        <CustomAlertBox
          visible={showLogoutConfirm}
          title="Ausloggen"
          message="Möchten Sie sich wirklich ausloggen?"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            confirmLogout()
            setShowLogoutConfirm(false)
          }}
          cancelText="Abbrechen"
          confirmText="Ausloggen"
          extraConfirmButtonStyle={{ backgroundColor: 'rgba(255,0,0,0.8)' }}
        />
      )}
      {showDeleteConfirm && (
        <CustomAlertBox
          visible={showDeleteConfirm}
          title="Konto löschen"
          message="Sind Sie sicher, dass Sie Ihr Konto dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            onPressDeleteUserAccount()
          }}
          cancelText="Abbrechen"
          confirmText="Löschen"
          extraConfirmButtonStyle={{ backgroundColor: '#8B0000' }}
        />
      )}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelect={(subscription: { id: string; title: string; price: string; description: string }) => {
          console.log('User selected subscription:', subscription)
          // Optionally send this to your backend or store in state
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          padding: 16,
          // backgroundColor: '#fff',
          borderTopWidth: 0,
          paddingHorizontal: 25,
          // borderColor: '#ddd',
        }}
      >
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'rgba(255,0,0,0.8)',
            backgroundColor: '#ffe6e6',
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 25,
            justifyContent: 'space-between',
          }}
          onPress={handleDeleteAccount}
        >
          <Text style={{ color: 'rgba(255,0,0,0.8)', fontSize: 16, fontWeight: '600' }}>
            Delete Account
          </Text>
          <MaterialIcons name="delete" size={24} color="rgba(255,0,0,0.8)" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
