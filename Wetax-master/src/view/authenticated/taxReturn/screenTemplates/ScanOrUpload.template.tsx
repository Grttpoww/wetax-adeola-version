import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'
import { Lens } from 'monocle-ts'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Text, TouchableOpacity, View, useWindowDimensions, Image, Alert } from 'react-native'
import { useTheme } from 'styled-components'
import { Button, ButtonType } from '../../../../components/shared'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import {
  ApiService,
  MimeType,
  ScanResponse,
  ScanType_Lohnausweis,
  ScanType_Bankkonto,
  ScanResponseBankkonto,
  TaxReturnData,
} from '../../../../openapi'
import { useArrayManager } from '../context/ArrayManager.context'
import { useScreenManager } from '../context/ScreenManager.context'
import { ContentScrollView } from '../scaffold/ContentScrollView'
import { ScreenScanOrUploadArray, ScreenScanOrUploadObj, ScreenScanOrUploadArrayBankkonto, TaxReturnDataKey } from '../types'

const ScanOrUploadTemplate = (props: {
  update: (res: ScanResponse, setLoading?: (loading: boolean) => void) => void
  scanType: ScanType_Lohnausweis | ScanType_Bankkonto
  text?: string
}) => {
  const { width } = useWindowDimensions()

  const [isLoading, setIsLoading] = useState(false)
  const [fileUri, setFileUri] = useState<{
    mimeType: 'image/png' | 'image/jpeg' | 'application/pdf'
    uri: string
    name?: string
  } | null>(null)

  const theme = useTheme()

  // File size limit: 10 MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB in bytes

  const validateFileSize = (size: number | undefined, fileName: string): boolean => {
    if (!size) {
      Alert.alert('Error', 'Unable to determine file size.')
      return false
    }
    if (size > MAX_FILE_SIZE) {
      Alert.alert(
        'File Too Large',
        `The file "${fileName}" exceeds the maximum upload limit of 10 MB. Please select a smaller file.`
      )
      return false
    }
    return true
  }

  const options: Array<{
    label: string
    icon: (iconProps: { size: number; color: string }) => ReactNode
    onPress: () => void
  }> = [
      {
        label: 'Foto aufnehmen',
        icon: (iconProps) => <AntDesign name="camera" {...iconProps} />,
        onPress: async () => {
          try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
              Alert.alert(
                'Permission Required',
                'Camera permission is required to take photos.'
              )
              return
            }

            // Launch native camera app
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0]

              // Validate file size
              if (asset.fileSize && !validateFileSize(asset.fileSize, 'captured photo')) {
                return
              }

              setFileUri({
                uri: asset.uri,
                mimeType: 'image/jpeg'
              })
            }
          } catch (error) {
            console.error('Error taking photo:', error)
            Alert.alert('Error', 'Failed to take photo')
          }
        },
      },

      {
        label: 'Foto hochladen',
        icon: (iconProps) => <Ionicons name="image" {...iconProps} />,
        onPress: async () => {
          try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
              Alert.alert(
                'Permission Required',
                'Photo library permission is required to select photos.'
              )
              return
            }

            // Launch native photo gallery
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0]

              // Validate file size
              if (asset.fileSize && !validateFileSize(asset.fileSize, 'selected photo')) {
                return
              }

              setFileUri({
                uri: asset.uri,
                mimeType: 'image/jpeg'
              })
            }
          } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Error', 'Failed to pick image')
          }
        },
      },
      {
        label: 'PDF hochladen',
        icon: (iconProps) => <AntDesign name="file" {...iconProps} />,
        onPress: async () => {
          try {
            const res = await DocumentPicker.getDocumentAsync({
              type: 'application/pdf',
              copyToCacheDirectory: true,
              multiple: false,
            })

            if (!res.canceled && res.assets && res.assets.length > 0) {
              const asset = res.assets[0]

              // Validate file size
              if (!validateFileSize(asset.size, asset.name)) {
                return
              }

              setFileUri({
                uri: asset.uri,
                mimeType: 'application/pdf',
                name: asset.name
              })
            }
          } catch (error) {
            console.error('Error picking PDF:', error)
            Alert.alert('Error', 'Failed to pick PDF')
          }
        },
      },
    ]

  const submit = useCallback(async () => {
    if (!fileUri) {
      throw new Error('No file uri')
    }

    setIsLoading(true)

    try {
      const file = new File(fileUri.uri)
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      let binary = ''
      uint8Array.forEach((byte) => {
        binary += String.fromCharCode(byte)
      })
      const data = btoa(binary)

      return ApiService.scan({
        data,
        mimeType: fileUri.mimeType as MimeType,
        type: props.scanType as any,
      })
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [fileUri])

  return (
    <ContentScrollView>
      {!fileUri ? (
        <View
          style={{
            gap: 16,
          }}
        >
          {props.text && (
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.TEXT,
                opacity: 0.5,
              }}
            >
              {props.text}
            </Text>
          )}
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.TEXT,
              opacity: 0.6,
              fontStyle: 'italic',
              marginBottom: 8,
            }}
          >
            Maximum upload limit: 10 MB
          </Text>
          {options.map((o, index) => (
            <TouchableOpacity
              key={index}
              onPress={o.onPress}
              style={{
                width: '100%',
                borderRadius: 15,
                padding: 24,
                backgroundColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                {o.icon({ size: 32, color: 'rgba(0,0,0,0.8)' })}
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{o.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={{
            width: '100%',
            borderRadius: 8,
            marginTop: 24,
            marginBottom: 0,
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 18, opacity: 0.4 }}>File is ready to be uploaded</Text>

          {/* File Preview */}
          <View
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
            }}
          >
            {fileUri.mimeType === 'application/pdf' ? (
              <View style={{ alignItems: 'center', gap: 12, padding: 20 }}>
                <Ionicons name="document-text" size={64} color="#FF6B6B" />
                <Text style={{ fontSize: 16, fontWeight: '500' }}>PDF Document</Text>
                {fileUri.name && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#333',
                      textAlign: 'center',
                      paddingHorizontal: 20,
                    }}
                    numberOfLines={2}
                  >
                    {fileUri.name}
                  </Text>
                )}
                <Text style={{ fontSize: 14, opacity: 0.6 }}>Ready to upload</Text>
              </View>
            ) : (
              <Image
                source={{ uri: fileUri.uri }}
                style={{
                  width: '100%',
                  height: 200,
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>

          <Button
            label={'Remove file'}
            type={ButtonType.ChromelessDark}
            disabled={!fileUri}
            onPress={() => {
              setFileUri(null)
            }}
          />
        </View>
      )}

      <Button
        label={'Upload'}
        type={ButtonType.Dark}
        disabled={!fileUri || isLoading}
        isLoading={isLoading}
        onPress={() => {
          submit()
            .then((res: ScanResponse) => {
              props.update(res, setIsLoading)
            })
            .catch((error) => {
              console.error('Upload failed:', error)
              setIsLoading(false)
              // You can add toast notification or alert here if needed
            })
        }}
        style={{
          background: {
            borderRadius: 30,
          },
        }}
      />
    </ContentScrollView>
  )
}

export const ScanOrUploadTemplateObj = <T extends TaxReturnDataKey>(props: {
  screen: ScreenScanOrUploadObj<T>
}) => {
  const { awaitNext } = useScreenManager()
  const { taxReturn, update } = useTaxReturn()
  const lens = Lens.fromPath<TaxReturnData>()([props.screen.dataKey, 'data'])

  return (
    <ScanOrUploadTemplate
      scanType={ScanType_Lohnausweis.LOHNAUSWEIS}
      text={props.screen.text}
      update={(res, setLoading) => {
        update(
          lens.set(props.screen.updateItem(res, taxReturn.data))(
            props.screen.update ? props.screen.update(res, taxReturn.data) : taxReturn.data,
          ),
        )

        awaitNext()

        // Clear loading after screen transition
        if (setLoading) {
          setTimeout(() => setLoading(false), 100)
        }
      }}
    />
  )
}

export const ScanOrUploadTemplateArray = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenScanOrUploadArray<T, U>
}) => {
  const { awaitNext } = useScreenManager()
  const { taxReturn } = useTaxReturn()
  const { updateItem } = useArrayManager<U>()

  return (
    <ScanOrUploadTemplate
      scanType={ScanType_Lohnausweis.LOHNAUSWEIS}
      text={props.screen.text}
      update={(res, setLoading) => {
        const updatedItem = props.screen.updateItem(res, taxReturn.data)

        updateItem(
          updatedItem,
          props.screen.update ? props.screen.update(res, taxReturn.data) : undefined,
        )
        awaitNext()

        // Clear loading after screen transition
        if (setLoading) {
          setTimeout(() => setLoading(false), 100)
        }
      }}
    />
  )
}

export const ScanOrUploadTemplateArrayBankkonto = <T extends TaxReturnDataKey, U extends {}>(props: {
  screen: ScreenScanOrUploadArrayBankkonto<T, U>
}) => {
  const { awaitNext } = useScreenManager()
  const { taxReturn } = useTaxReturn()
  const { updateItem } = useArrayManager<U>()

  return (
    <ScanOrUploadTemplate
      scanType={ScanType_Bankkonto.BANKKONTO}
      text={props.screen.text}
      update={(res, setLoading) => {
        const updatedItem = props.screen.updateItem(res as any, taxReturn.data)

        updateItem(
          updatedItem,
          props.screen.update ? props.screen.update(res as any, taxReturn.data) : undefined,
        )
        awaitNext()

        // Clear loading after screen transition
        if (setLoading) {
          setTimeout(() => setLoading(false), 100)
        }
      }}
    />
  )
}
