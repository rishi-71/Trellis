import React, { useState, useEffect } from 'react';
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

interface FinderProps {
  token: string;
  backendUrl: string;
}

export default function FinderModule({ token, backendUrl }: FinderProps) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [cabins, setCabins] = useState<any[]>([]);
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routePath, setRoutePath] = useState<any>(null);


  const fetchFinderData = async () => {
    try {
      const locRes = await fetch(`${backendUrl}/api/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const locData = await locRes.json();
      if (locData.success) setLocations(locData.locations);

      const cabRes = await fetch(`${backendUrl}/api/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cabData = await cabRes.json();
      if (cabData.success) setCabins(cabData.cabins || []);
    } catch (err: any) {
      console.log('Error fetching finder data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRoute = async () => {
    if (!routeFrom || !routeTo) {
      Alert.alert('Error', 'Please fill in both start and destination');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/route?from=${routeFrom}&to=${routeTo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRoutePath(data);
      } else {
        Alert.alert('Route Error', data.message || 'No route found');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to retrieve shortest path');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFinderData();
    }, 0);
    return () => clearTimeout(t);
  }, [backendUrl, token]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📍 Smart Campus Finder</Text>
      
      <Text style={styles.label}>Start Node</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. node-home"
        value={routeFrom}
        onChangeText={setRouteFrom}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Destination Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. classroom-101"
        value={routeTo}
        onChangeText={setRouteTo}
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSearchRoute}>
        <Text style={styles.btnText}>Find Shortest Route</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      {routePath && (
        <View style={styles.routeBox}>
          <Text style={styles.routeBoxTitle}>Route Calculated:</Text>
          <Text style={styles.routeTxt}>Distance: {routePath.totalDistance} meters</Text>
          <Text style={styles.routeTxt}>Path: {routePath.path?.join(' ➔ ')}</Text>
          {routePath.directions?.map((dir: string, idx: number) => (
            <Text key={idx} style={styles.routeTxt}>• {dir}</Text>
          ))}
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>Active Cabins Directory</Text>
      {cabins.length === 0 ? (
        <Text style={styles.emptyText}>No cabins loaded.</Text>
      ) : (
        cabins.map((cab, idx) => (
          <View key={cab._id || idx} style={styles.itemRow}>
            <Text style={styles.itemBold}>{cab.facultyName} ({cab.cabinName})</Text>
            <Text style={styles.itemSub}>{cab.designation} | Status: {cab.status}</Text>
          </View>
        ))
      )}
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
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: Spacing.two,
    color: '#000',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6F4EA',
    marginVertical: Spacing.four,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  sectionSub: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.two,
  },
  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemBold: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 14,
  },
  itemSub: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  routeBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  routeTxt: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
});
