import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface SOSProps {
  token: string;
  backendUrl: string;
}

export default function SOSModule({ token, backendUrl }: SOSProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Campus Gate 1 (Main Entrance)');

  const handleTriggerSOS = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/sos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ location })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('🚨 ALARM TRIGGERED', 'Campus Security dispatch has been sent your location.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failure triggering SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🚨 Campus Security Dispatch</Text>

      <View style={styles.sosContainer}>
        <Text style={styles.sosWarning}>CRITICAL ASSISTANCE WIDGET</Text>
        <Text style={styles.sosSub}>
          Pressing the panic button below will alert all nearby campus officers and transmit your designated location.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Update your current block/location..."
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#9CA3AF"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#EF4444" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={styles.sosPanicBtn} onPress={handleTriggerSOS}>
            <Text style={styles.sosPanicBtnTxt}>SOS</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    width: '100%',
    marginBottom: Spacing.four,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
  sosWarning: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  sosSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.five,
    lineHeight: 18,
  },
  sosPanicBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sosPanicBtnTxt: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  }
});
