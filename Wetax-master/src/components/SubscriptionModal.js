// import React, { useState } from 'react'
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native'

// const subscriptions = [
//   {
//     id: 'free',
//     title: 'Free Plan',
//     price: '0 CHF',
//     description: 'Basic access with limited features.',
//   },
//   {
//     id: 'premium',
//     title: 'Premium Plan',
//     price: '30 CHF',
//     description: 'Full access to all premium features.',
//   },
// ]

// const SubscriptionModal = ({ visible, onClose, onSelect }) => {
//   const [selectedId, setSelectedId] = useState(null)

//   const renderItem = ({ item }) => {
//     const isSelected = selectedId === item.id

//     return (
//       <TouchableOpacity
//         style={[styles.card, isSelected && styles.cardSelected]}
//         onPress={() => {
//           setSelectedId(item.id)
//           onSelect(item) // Notify parent with selected subscription
//           onClose() // Close the modal
//         }}
//       >
//         <Text style={styles.title}>{item.title}</Text>
//         <Text style={styles.price}>{item.price}</Text>
//         <Text style={styles.description}>{item.description}</Text>
//       </TouchableOpacity>
//     )
//   }

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <Text style={styles.header}>Choose Your Subscription</Text>
//           <FlatList
//             data={subscriptions}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.list}
//           />
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Text style={{ color: '#fff' }}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   )
// }

// export default SubscriptionModal

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   list: {
//     paddingBottom: 12,
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   cardSelected: {
//     borderColor: '#1D2DBA',
//     borderWidth: 2,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   price: {
//     fontSize: 16,
//     marginVertical: 6,
//     color: '#555',
//   },
//   description: {
//     fontSize: 14,
//     color: '#777',
//   },
//   closeButton: {
//     backgroundColor: '#1D2DBA',
//     borderRadius: 8,
//     paddingVertical: 10,
//     alignItems: 'center',
//     marginTop: 16,
//   },
// })

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, Pressable } from 'react-native'

const subscriptions = [
  {
    id: 'free',
    title: 'Free Plan',
    price: '0 CHF',
    description: 'Basic access with limited features.',
  },
  {
    id: 'premium',
    title: 'Premium Plan',
    price: '30 CHF',
    description: 'Full access to all premium features.',
  },
]

const SubscriptionModal = ({ visible, onClose, onSelect }) => {
  const [selectedId, setSelectedId] = useState(null)

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.id

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => {
          setSelectedId(item.id)
          onSelect(item)
          //   onClose()
        }}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <Text style={styles.header}>Choose Your Subscription</Text>
          <FlatList
            data={subscriptions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: '#fff' }}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default SubscriptionModal

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#1D2DBA',
    borderWidth: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    marginVertical: 6,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#777',
  },
  closeButton: {
    backgroundColor: '#1D2DBA',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
})
