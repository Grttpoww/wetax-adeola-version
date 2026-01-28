import AsyncStorage from '@react-native-async-storage/async-storage'
import { OpenAPI } from '../openapi'

export const API_URL = "https://wetaxorg.ch"

OpenAPI.BASE = `${API_URL}/api`

OpenAPI.HEADERS = async () => {
  const token = await AsyncStorage.getItem('@token')
  return {
    'x-access-token': token || '',
  }
}

console.log('Connected to: ', OpenAPI.BASE)
