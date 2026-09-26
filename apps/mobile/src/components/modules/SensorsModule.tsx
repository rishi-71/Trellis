import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ScrollView,
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
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');

  // User Profile Defaults
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [defaultName, setDefaultName] = useState('');
  const [defaultEnrollment, setDefaultEnrollment] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');

  // Modal State for Apply Form
  const [selectedSensor, setSelectedSensor] = useState<any | null>(null);
  const [studentName, setStudentName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState('7 Days');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal State for Faculty Issued Students List
  const [viewingIssuedSensor, setViewingIssuedSensor] = useState<any | null>(null);
  const [issuedStudents, setIssuedStudents] = useState<any[]>([]);
  const [loadingIssued, setLoadingIssued] = useState(false);

  // 1. Fetch User Profile for Autofill
  useEffect(() => {
    if (!token) return;
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.user?.role) setUserRole(data.user.role);
          if (data.profile) {
            const p = data.profile;
            const n = p.name || data.user?.name || '';
            const roll = p.rollNumber || p.collegeId || '';
            const br = p.branch || p.department || '';
            const ph = p.contact || '';

            setDefaultName(n);
            setDefaultEnrollment(roll);
            setDefaultBranch(br);
            setDefaultPhone(ph);

            setStudentName(n);
            setEnrollmentNo(roll);
            setBranch(br);
            setPhone(ph);
          }
        }
      })
      .catch((err) => console.log('Error fetching user profile:', err));
  }, [token, backendUrl]);

  // 2. Fetch Module Data
  const fetchSensorsData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const sRes = await fetch(`${backendUrl}/api/sensors-module/sensors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sData = await sRes.json();
      if (sData.success) setSensors(sData.sensors || []);

      // Fetch requests
      const srRes = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const srData = await srRes.json();
      if (srData.success) setMyRequests(srData.requests || []);
    } catch (err: any) {
      console.log('Error fetching sensor module:', err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchSensorsData();
  }, [fetchSensorsData]);

  // 3. Dynamic Auto-Sync: Polls every 4 seconds so updates appear without app refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorsData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchSensorsData]);

  const handleOpenApply = (sensor: any) => {
    setSelectedSensor(sensor);
    setStudentName(studentName || defaultName || '');
    setEnrollmentNo(enrollmentNo || defaultEnrollment || '');
    setBranch(branch || defaultBranch || '');
    setPhone(phone || defaultPhone || '');
    setDuration('7 Days');
    setPurpose('');
  };

  const handleSubmitApply = async () => {
    if (!selectedSensor) return;
    if (!studentName.trim() || !enrollmentNo.trim() || !branch.trim() || !phone.trim() || !purpose.trim()) {
      Alert.alert('Required Fields', 'Please fill in Student Name, Enrollment No, Branch, Phone, and Purpose.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/sensors-module/sensor-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          sensorId: selectedSensor._id,
          studentName,
          enrollmentNo,
          branch,
          phone,
          duration,
          purpose,
          projectName: 'Academic Lab Work'
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Request Submitted', 'Your sensor rental request was submitted and is pending faculty review.');
        setSelectedSensor(null);
        setPurpose('');
        setActiveTab('requests');
        fetchSensorsData();
      } else {
        Alert.alert('Error', data.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Faculty Actions
  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    // Optimistic UI update
    setMyRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, status: decision } : r))
    );

    try {
      const res = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Updated', `Request has been ${decision}!`);
        fetchSensorsData(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update request.');
      fetchSensorsData(true);
    }
  };

  const handleReturn = async (requestId: string) => {
    setMyRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, status: 'returned' } : r))
    );

    try {
      const res = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/${requestId}/return`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ condition: 'ok' })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Returned', 'Sensor marked as Returned & inventory restored!');
        fetchSensorsData(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to return sensor.');
      fetchSensorsData(true);
    }
  };

  const handleViewIssued = async (sensor: any) => {
    setViewingIssuedSensor(sensor);
    setLoadingIssued(true);
    try {
      const res = await fetch(`${backendUrl}/api/sensors-module/sensors/${sensor._id}/issued-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIssuedStudents(data.requests || []);
      }
    } catch (err: any) {
      console.log('Error fetching issued students:', err.message);
    } finally {
      setLoadingIssued(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🔬 IoT Sensor Issuing & Rentals</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabBtnTxt, activeTab === 'catalog' && styles.tabBtnTxtActive]}>
            📦 Sensor Catalog ({sensors.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabBtnTxt, activeTab === 'requests' && styles.tabBtnTxtActive]}>
            📋 Requests & Loans ({myRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && sensors.length === 0 && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      {/* TAB 1: CATALOG */}
      {activeTab === 'catalog' && (
        <View style={{ marginTop: 12 }}>
          {sensors.length === 0 ? (
            <Text style={styles.emptyText}>No sensors catalog items found.</Text>
          ) : (
            sensors.map((sensor, idx) => {
              const inStock = sensor.availableQuantity > 0;
              return (
                <View key={sensor._id || idx} style={styles.sensorCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.sensorName}>{sensor.name}</Text>
                    <Text style={styles.sensorSub}>Dept: {sensor.department}</Text>
                    <Text style={[styles.stockText, { color: inStock ? '#047857' : '#EF4444' }]}>
                      {inStock ? `🟢 Available: ${sensor.availableQuantity} / ${sensor.totalQuantity}` : '🔴 Out of Stock'}
                    </Text>
                  </View>

                  <View style={{ gap: 6 }}>
                    <TouchableOpacity 
                      style={[styles.applyBtn, !inStock && styles.disabledBtn]} 
                      disabled={!inStock}
                      onPress={() => handleOpenApply(sensor)}
                    >
                      <Text style={styles.applyBtnTxt}>{inStock ? 'Apply for Rent' : 'Out of Stock'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.historyBtn} 
                      onPress={() => handleViewIssued(sensor)}
                    >
                      <Text style={styles.historyBtnTxt}>👥 View Loans</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* TAB 2: REQUESTS & STATUS */}
      {activeTab === 'requests' && (
        <View style={{ marginTop: 12 }}>
          {myRequests.length === 0 ? (
            <Text style={styles.emptyText}>No sensor requests recorded yet.</Text>
          ) : (
            myRequests.map((req, idx) => {
              let badgeBg = '#FEF3C7';
              let badgeColor = '#92400E';
              let badgeText = 'PENDING REVIEW';

              if (req.status === 'approved' || req.status === 'issued') {
                badgeBg = '#D1FAE5';
                badgeColor = '#065F46';
                badgeText = 'APPROVED / ACTIVE';
              } else if (req.status === 'rejected') {
                badgeBg = '#FEE2E2';
                badgeColor = '#991B1B';
                badgeText = 'REJECTED';
              } else if (req.status === 'returned') {
                badgeBg = '#F3F4F6';
                badgeColor = '#4B5563';
                badgeText = 'RETURNED';
              }

              return (
                <View key={req._id || idx} style={styles.requestCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.sensorName}>{req.sensorId?.name || req.sensorName || 'Sensor'}</Text>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.badgeTxt, { color: badgeColor }]}>{badgeText}</Text>
                    </View>
                  </View>

                  <Text style={styles.reqDetail}>👤 {req.studentName} ({req.enrollmentNo}) - {req.branch}</Text>
                  <Text style={styles.reqDetail}>⏱️ Duration: {req.duration} | 📞 {req.phone}</Text>
                  <Text style={styles.reqDetail}>📝 Purpose: {req.purpose}</Text>
                  {req.approvalNote ? (
                    <Text style={[styles.reqDetail, { fontStyle: 'italic', color: '#047857', marginTop: 2 }]}>
                      Note: {req.approvalNote}
                    </Text>
                  ) : null}

                  {/* Faculty Actions */}
                  {(userRole === 'faculty' || userRole === 'admin') && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                      {req.status === 'pending' && (
                        <>
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                            onPress={() => handleDecision(req._id, 'approved')}
                          >
                            <Text style={styles.actionBtnTxt}>✓ Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                            onPress={() => handleDecision(req._id, 'rejected')}
                          >
                            <Text style={styles.actionBtnTxt}>✕ Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {(req.status === 'approved' || req.status === 'issued') && (
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: '#374151' }]}
                          onPress={() => handleReturn(req._id)}
                        >
                          <Text style={styles.actionBtnTxt}>🔄 Mark Returned</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* APPLY FOR RENT MODAL (AUTO-FILLED & EDITABLE) */}
      <Modal visible={!!selectedSensor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Apply for Sensor Rental</Text>
            {selectedSensor && (
              <Text style={styles.modalSub}>{selectedSensor.name} ({selectedSensor.department})</Text>
            )}
            <Text style={{ fontSize: 10, color: '#065F46', marginBottom: 6 }}>
              ✨ Details auto-filled from your profile. Edit if needed.
            </Text>

            <ScrollView style={{ maxHeight: 380, marginVertical: 8 }}>
              <Text style={styles.label}>Student Full Name *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Rishi Patole" 
                value={studentName} 
                onChangeText={setStudentName} 
              />

              <Text style={styles.label}>Enrollment Number *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 0808CS211045" 
                value={enrollmentNo} 
                onChangeText={setEnrollmentNo} 
              />

              <Text style={styles.label}>Branch / Department *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. CSE / ECE / IoT" 
                value={branch} 
                onChangeText={setBranch} 
              />

              <Text style={styles.label}>Contact Phone Number *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 9876543210" 
                keyboardType="phone-pad"
                value={phone} 
                onChangeText={setPhone} 
              />

              <Text style={styles.label}>Duration of Rental *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 7 Days, 14 Days, 1 Month" 
                value={duration} 
                onChangeText={setDuration} 
              />

              <Text style={styles.label}>Purpose of Rental *</Text>
              <TextInput 
                style={[styles.input, { height: 70 }]} 
                placeholder="Describe project or lab purpose..." 
                multiline 
                value={purpose} 
                onChangeText={setPurpose} 
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]} 
                onPress={() => setSelectedSensor(null)}
              >
                <Text style={{ fontWeight: 'bold', color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#10B981' }]} 
                disabled={submitting}
                onPress={handleSubmitApply}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VIEW ISSUED STUDENTS MODAL */}
      <Modal visible={!!viewingIssuedSensor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👥 Active Loans & Issued Students</Text>
            {viewingIssuedSensor && (
              <Text style={styles.modalSub}>{viewingIssuedSensor.name}</Text>
            )}

            {loadingIssued ? (
              <ActivityIndicator color="#10B981" style={{ marginVertical: 24 }} />
            ) : (
              <ScrollView style={{ maxHeight: 350, marginVertical: 8 }}>
                {issuedStudents.length === 0 ? (
                  <Text style={styles.emptyText}>No student loans on record for this sensor.</Text>
                ) : (
                  issuedStudents.map((st, idx) => (
                    <View key={st._id || idx} style={styles.issuedCard}>
                      <Text style={styles.issuedName}>{st.studentName} ({st.enrollmentNo})</Text>
                      <Text style={styles.issuedDetail}>{st.branch} | 📞 {st.phone}</Text>
                      <Text style={styles.issuedDetail}>⏱️ Duration: {st.duration} | Status: {st.status.toUpperCase()}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: '#374151', marginTop: 12 }]} 
              onPress={() => setViewingIssuedSensor(null)}
            >
              <Text style={{ fontWeight: 'bold', color: '#FFF', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 17,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: Spacing.two,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnTxt: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  tabBtnTxtActive: {
    color: '#065F46',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  sensorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  sensorName: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1F2937',
  },
  sensorSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  applyBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#D1D5DB',
  },
  applyBtnTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyBtn: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  historyBtnTxt: {
    color: '#374151',
    fontSize: 9,
    fontWeight: 'bold',
  },
  requestCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTxt: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  reqDetail: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBtnTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
    marginBottom: 3,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  issuedCard: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  issuedName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  issuedDetail: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
});
