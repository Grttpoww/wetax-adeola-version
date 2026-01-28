import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { ApiService, UpdateUserDataBody, UserT } from '../openapi'
import { SafeLoading } from '../components/configured/SafeLoading'
// import { getUniqueId } from 'react-native-device-info'

type UserContextT = {
  user?: UserT
  update: (data: UpdateUserDataBody) => Promise<void>
  isUpdating: boolean
  refetch: () => Promise<any>
}

export const useUser = (): Required<UserContextT> => {
  const val = useContext(UserContext)
  if (!val?.user) {
    throw new Error('User not found')
  }

  return {
    ...val,
    user: val.user,
  }
}

export const useOptionalUser = (): UserContextT => {
  const val = useContext(UserContext)

  if (!val) {
    throw new Error('User context not found')
  }

  return val
}

const UserContext = createContext<UserContextT | undefined>(undefined)

UserContext.displayName = 'UserContext'

export const UserProvider = (props: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const [hasToken, setToken] = useState<boolean>()

  const fetchUser = async () => {
    // PRE-FLIGHT CHECK: Verify token exists
    const token = await AsyncStorage.getItem('@token')
    if (!token) {
      throw new Error('No token found')
    }

    console.log('[USER] Fetching user data...')
    
    // API-Call with timeout wrapper
    const getUserPromise = ApiService.getUser()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('getUser timeout after 30s'))
      }, 30000)
    })

    try {
      const user = await Promise.race([getUserPromise, timeoutPromise]) as UserT
      console.log('[USER] User data fetched successfully')
      return user
    } catch (e: any) {
      console.error('[USER] Error fetching user:', e)
      AsyncStorage.removeItem('@token')
      setToken(false)
      throw e
    }
  }

  const { data: user, refetch } = useQuery<UserT>({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: hasToken,
  })

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('@token')
      const hasTokenNow = token !== null

      // If token state changed from false to true, refetch user data
      if (hasToken === false && hasTokenNow) {
        setToken(hasTokenNow)
        // Small delay to ensure token is set in headers
        setTimeout(() => refetch(), 100)
      } else {
        setToken(hasTokenNow)
      }
    }

    checkToken()

    // Check periodically for token changes (e.g., after login)
    const interval = setInterval(checkToken, 500)
    return () => clearInterval(interval)
  }, [hasToken, refetch])

  const update = useMutation({
    mutationFn: ApiService.updateUserData,
    onSuccess: (v, meta) => {
      queryClient.setQueryData<UserT | undefined>(['user'], (u) => {
        return u ? { ...u, user: { ...u.user, ...meta } } : undefined
      })
    },
  })

  if (hasToken && !user) {
    return <SafeLoading />
  }

  return (
    <UserContext.Provider
      value={{
        user,
        update: update.mutateAsync,
        isUpdating: update.isPending,
        refetch,
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}
