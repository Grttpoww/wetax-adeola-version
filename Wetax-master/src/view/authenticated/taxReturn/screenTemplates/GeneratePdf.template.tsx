import { Platform, View, Alert, Modal, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import { Button, ButtonType } from '../../../../components/shared'
import { ApiService, OpenAPI } from '../../../../openapi'
import { useTaxReturn } from '../../../../context/TaxReturn.context'
import { useUser } from '../../../../context/User.context'
import { documentDirectory, writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as RNIap from 'react-native-iap'
import { SubscriptionService } from '../../../../services/subscription.service'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUBSCRIPTION_SKU = Platform.select({
  ios: 'wetax.subscription.yearly',
  android: 'wetax_subscription_yearly',
}) || 'wetax.subscription.yearly'

export const GeneratePdfTemplate = (props: {}) => {
  const { taxReturn } = useTaxReturn()
  const { user, refetch } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloadingXml, setIsDownloadingXml] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription()
  }, [])

  // Initialize IAP connection
  useEffect(() => {
    let purchaseUpdateSubscription: any
    let purchaseErrorSubscription: any

    const initIAP = async () => {
      try {
        await RNIap.initConnection()
        console.log('IAP connection initialized')

        // Listen for purchase updates
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
          console.log('Purchase updated:', purchase)
          const receipt = purchase.transactionReceipt || purchase.purchaseToken

          if (receipt) {
            try {
              // Verify and activate subscription on server
              await SubscriptionService.activateSubscription({
                transactionId: purchase.transactionId,
                originalTransactionId: purchase.originalTransactionId,
                productId: purchase.productId,
                receipt,
              })

              // Finish the transaction
              await RNIap.finishTransaction({ purchase, isConsumable: false })

              Alert.alert('Success', 'Subscription activated successfully!')
              setShowPaymentModal(false)
              setIsProcessingPayment(false)
              await checkSubscription()
              await refetch()
            } catch (error) {
              console.error('Error activating subscription:', error)
              Alert.alert('Error', 'Failed to activate subscription. Please contact support.')
              setIsProcessingPayment(false)
            }
          }
        })

        // Listen for purchase errors
        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
          console.warn('Purchase error:', error)
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase Error', error.message || 'Failed to complete purchase')
          }
          setIsProcessingPayment(false)
        })
      } catch (error) {
        console.error('IAP initialization error:', error)
      }
    }

    initIAP()

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove()
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove()
      }
      RNIap.endConnection()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      setIsCheckingSubscription(true)
      const status = await SubscriptionService.checkSubscriptionStatus()
      setHasActiveSubscription(status.isActive)
    } catch (error) {
      console.error('Error checking subscription:', error)
      setHasActiveSubscription(false)
    } finally {
      setIsCheckingSubscription(false)
    }
  }

  const downloadPdf = async () => {
    // Check subscription before downloading
    if (!hasActiveSubscription) {
      Alert.alert(
        'Subscription Required',
        'You need an active subscription to download PDFs. Please subscribe to continue.',
        [{ text: 'OK', onPress: () => setShowPaymentModal(true) }]
      )
      return
    }

    try {
      setIsDownloading(true)
      console.log('Starting PDF generation...')

      const result = await ApiService.generatePdf(taxReturn._id)
      console.log('PDF generated successfully')

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `Steuererklaerung_${timestamp}.pdf`

      // Use cache directory for better iOS compatibility with sharing
      const fileUri = `${Platform.OS === 'ios' ? cacheDirectory : documentDirectory}${fileName}`

      // Write the PDF file
      await writeAsStringAsync(fileUri, result.base64, {
        encoding: 'base64',
      })
      console.log('PDF saved to:', fileUri)

      if (Platform.OS === 'ios') {
        // On iOS, use the sharing sheet which allows saving to Files, sharing, etc.
        try {
          const isAvailable = await Sharing.isAvailableAsync()
          console.log('Sharing available:', isAvailable)

          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Steuererklärung PDF speichern',
              UTI: 'com.adobe.pdf',
            })
            console.log('PDF shared successfully')
            // Don't show success alert here as sharing sheet handles the UX
          } else {
            throw new Error('Sharing not available')
          }
        } catch (sharingError) {
          console.error('Sharing error:', sharingError)

          // Fallback: Show alert with file location info
          Alert.alert(
            'PDF Generiert',
            `PDF wurde erfolgreich erstellt.\n\nDateiname: ${fileName}\n\nHinweis: Die Datei wurde in den App-Dokumenten gespeichert. Verwenden Sie die Teilen-Funktion, um sie zu speichern oder zu öffnen.`,
            [
              {
                text: 'OK',
                style: 'default'
              },
              {
                text: 'Erneut versuchen',
                style: 'default',
                onPress: () => {
                  // Retry sharing
                  Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Steuererklärung PDF',
                  }).catch(console.error)
                }
              }
            ]
          )
        }
      } else {
        // Android handling
        try {
          const IntentLauncher = await import('expo-intent-launcher')
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: fileUri,
            flags: 1,
            type: 'application/pdf',
          })
        } catch (androidError) {
          console.error('Android intent error:', androidError)
          // Fallback to sharing on Android too
          const isAvailable = await Sharing.isAvailableAsync()
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Steuererklärung PDF',
            })
          } else {
            Alert.alert('Error', 'PDF konnte nicht geöffnet werden')
          }
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      Alert.alert(
        'Download Fehler',
        'PDF konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true)

      // Request subscription purchase - using any to bypass type issues
      await (RNIap as any).requestPurchase(SUBSCRIPTION_SKU)

      // The purchase flow continues in the purchaseUpdatedListener
    } catch (error: any) {
      setIsProcessingPayment(false)
      if (error.code !== 'E_USER_CANCELLED') {
        console.error('Purchase error:', error)
        Alert.alert('Purchase Failed', 'Unable to start purchase. Please try again.')
      }
    }
  }

  const downloadXml = async () => {
    try {
      setIsDownloadingXml(true)
      console.log('Starting XML generation...')

      // Get token for authentication
      const token = await AsyncStorage.getItem('@token')
      const apiUrl = `${OpenAPI.BASE}/v1/tax-return/${taxReturn._id}/export-ech0119`

      // Fetch XML with proper headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-access-token': token || '',
          'Accept': 'application/xml',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get XML text
      const xmlText = await response.text()
      console.log('XML generated successfully')

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `steuererklärung-${taxReturn.year}.xml`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Use cache directory for better iOS compatibility with sharing
      const fileUri = `${Platform.OS === 'ios' ? cacheDirectory : documentDirectory}${filename}`

      // Write the XML file
      await writeAsStringAsync(fileUri, xmlText, {
        encoding: 'utf8',
      })
      console.log('XML saved to:', fileUri)

      if (Platform.OS === 'ios') {
        // On iOS, use the sharing sheet
        try {
          const isAvailable = await Sharing.isAvailableAsync()
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/xml',
              dialogTitle: 'Steuererklärung XML speichern',
              UTI: 'public.xml',
            })
            console.log('XML shared successfully')
          } else {
            throw new Error('Sharing not available')
          }
        } catch (sharingError) {
          console.error('Sharing error:', sharingError)
          Alert.alert(
            'XML Generiert',
            `XML wurde erfolgreich erstellt.\n\nDateiname: ${filename}\n\nHinweis: Die Datei wurde in den App-Dokumenten gespeichert. Verwenden Sie die Teilen-Funktion, um sie zu speichern oder zu öffnen.`,
            [
              {
                text: 'OK',
                style: 'default'
              },
              {
                text: 'Erneut versuchen',
                style: 'default',
                onPress: () => {
                  Sharing.shareAsync(fileUri, {
                    mimeType: 'application/xml',
                    dialogTitle: 'Steuererklärung XML',
                  }).catch(console.error)
                }
              }
            ]
          )
        }
      } else {
        // Android handling
        try {
          const IntentLauncher = await import('expo-intent-launcher')
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: fileUri,
            flags: 1,
            type: 'application/xml',
          })
        } catch (androidError) {
          console.error('Android intent error:', androidError)
          // Fallback to sharing on Android too
          const isAvailable = await Sharing.isAvailableAsync()
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/xml',
              dialogTitle: 'Steuererklärung XML',
            })
          } else {
            Alert.alert('Error', 'XML konnte nicht geöffnet werden')
          }
        }
      }
    } catch (error) {
      console.error('Error downloading XML:', error)
      Alert.alert(
        'Download Fehler',
        'XML konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.'
      )
    } finally {
      setIsDownloadingXml(false)
    }
  }

  const handleDownload = () => {
    if (hasActiveSubscription) {
      downloadPdf()
    } else {
      setShowPaymentModal(true)
    }
  }

  return (
    <View
      style={{
        padding: 24,
      }}
    >
      {isCheckingSubscription ? (
        <Button
          type={ButtonType.Dark}
          label="Checking subscription..."
          disabled={true}
          onPress={() => { }}
          style={{
            background: {
              borderRadius: 30,
            },
          }}
        />
      ) : hasActiveSubscription ? (
        <>
          <Button
            type={ButtonType.Dark}
            label="PDF herunterladen"
            isLoading={isDownloading}
            disabled={isDownloading || isDownloadingXml}
            onPress={downloadPdf}
            style={{
              background: {
                borderRadius: 30,
              },
            }}
          />
          <Button
            type={ButtonType.Dark}
            label="XML herunterladen"
            isLoading={isDownloadingXml}
            disabled={isDownloading || isDownloadingXml}
            onPress={downloadXml}
            style={{
              background: {
                borderRadius: 30,
                marginTop: 12,
              },
            }}
          />
        </>
      ) : (
        <Button
          type={ButtonType.Dark}
          label="Abonnieren und PDF herunterladen"
          disabled={isDownloading || isDownloadingXml}
          onPress={() => setShowPaymentModal(true)}
          style={{
            background: {
              borderRadius: 30,
            },
          }}
        />
      )}

      {hasActiveSubscription && (
        <Text style={{ textAlign: 'center', marginTop: 12, color: '#2e7d32', fontSize: 14 }}>
          ✓ Active Subscription - Download unlimited PDFs and XML
        </Text>
      )}

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent
        onRequestClose={() => !isProcessingPayment && setShowPaymentModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !isProcessingPayment && setShowPaymentModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>Laden Sie Ihre Steuererklärung herunter</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Preis</Text>
              <Text style={styles.priceAmount}>CHF 39.90/year</Text>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                Laden Sie Ihre vollständige Steuererklärung als PDF herunter.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.checkIconContainer}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <Text style={styles.featureText}>Professionell formatiert</Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.checkIconContainer}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <Text style={styles.featureText}>Bereit zur Einreichung</Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.checkIconContainer}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <Text style={styles.featureText}>Sofortiger Download</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, isProcessingPayment && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={isProcessingPayment}
            >
              <Text style={styles.payButtonText}>
                {isProcessingPayment ? 'Verarbeitung...' : 'Jetzt bezahlen'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaymentModal(false)}
              disabled={isProcessingPayment}
            >
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderColor: '#1D2DBA',
    borderWidth: 5,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D2DBA',
    marginBottom: 20,
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderColor: '#1D2DBA',
    borderWidth: 3,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1D2DBA',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1D2DBA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  payButton: {
    backgroundColor: '#1D2DBA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
})
