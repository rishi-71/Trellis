import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface SensorsProps {
  token: string;
  backendUrl: string;
}

export default function SensorsModule({ token, backendUrl }: SensorsProps) {
  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState<any[]>([]);
  const [sensorRequests, setSensorRequests] = useState<any[]>([]);



  const fetchSensorsData = useCallback(async () => {
    try {
      const sRes = await fetch(`${backendUrl}/api/sensors-module/sensors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sData = await sRes.json();
      if (sData.success) setSensors(sData.sensors);

      // Student requests resolution
      const srRes = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/student@ips.edu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const srData = await srRes.json();
      if (srData.success) setSensorRequests(srData.requests);
    } catch (err: any) {
      console.log('Error fetching sensor module:', err.message);
    }
  }, [backendUrl, token]);

  const handleRequestSensor = async (sensorId: string) => {
    setLoading(true);
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const res = await fetch(`${backendUrl}/api/sensors-module/sensor-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          sensorId,
          purpose: 'IoT Campus Project Work',
          projectName: 'Smart Campus OS Integration',
          requestedFrom: new Date(),
          requestedTo: nextWeek
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Request Sent', 'Your rental request is pending review.');
        fetchSensorsData();
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error submitting request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSensorsData();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchSensorsData]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🔬 IoT Sensor Issuing & Rentals</Text>
      <Text style={styles.sectionSub}>Available Sensor Hardware</Text>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      {sensors.length === 0 ? (
        <Text style={styles.emptyText}>No sensors catalog items found.</Text>
      ) : (
        sensors.map((sensor, idx) => (
          <View key={sensor._id || idx} style={styles.sensorRow}>
            <View>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <Text style={styles.sensorSub}>Available: {sensor.availableQuantity} / {sensor.totalQuantity}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.requestBtn, { opacity: sensor.availableQuantity <= 0 ? 0.5 : 1 }]} 
              disabled={sensor.availableQuantity <= 0}
              onPress={() => handleRequestSensor(sensor._id)}
            >
              <Text style={styles.requestBtnTxt}>Request Lease</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>My Active Rentals</Text>
      {sensorRequests.length === 0 ? (
        <Text style={styles.emptyText}>No checkouts requested yet.</Text>
      ) : (
        sensorRequests.map((req, idx) => (
          <View key={req._id || idx} style={styles.sensorRow}>
            <View>
              <Text style={styles.sensorName}>{req.sensorId?.name || 'IoT Device'}</Text>
              <Text style={styles.sensorSub}>Deadline: {new Date(req.requestedTo).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.statusTxt}>{req.status.toUpperCase()}</Text>
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
  sectionSub: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.two,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6F4EA',
    marginVertical: Spacing.four,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sensorName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1F2937',
  },
  sensorSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  requestBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  requestBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTxt: {
    fontWeight: 'bold',
    color: '#10B981',
    fontSize: 11,
  },
});
