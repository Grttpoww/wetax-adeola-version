import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'

type Subscription = {
  id: string
  title: string
  price: string
  description: string
}

const subscriptions: Subscription[] = [
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

const SubscriptionScreen = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const renderItem = ({ item }: { item: Subscription }) => {
    const isSelected = selectedId === item.id

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          {isSelected && <MaterialIcons name="check-circle" size={28} color="#1D2DBA" />}
        </View>
      </TouchableOpacity>
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Your Subscription</Text>
      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

export default SubscriptionScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#1D2DBA',
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
})
