import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

interface SensorItem {
  _id: string;
  name: string;
  type?: string;
  department?: string;
  totalQuantity: number;
  availableQuantity: number;
  conditionSummary?: string;
}

interface SensorLoanRequest {
  _id: string;
  sensorId?: SensorItem | any;
  sensorName?: string;
  studentId?: string;
  studentName: string;
  studentEmail?: string;
  enrollmentNo: string;
  branch: string;
  phone: string;
  duration: string;
  purpose: string;
  projectName?: string;
  status: 'pending' | 'approved' | 'issued' | 'returned' | 'rejected' | 'lost';
  dueAt?: string;
  issuedAt?: string;
  returnedAt?: string;
  approverName?: string;
  approvalNote?: string;
  returnCondition?: string;
  createdAt?: string;
}

export default function SensorsModule({ token, backendUrl }: SensorsProps) {
  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [allRequests, setAllRequests] = useState<SensorLoanRequest[]>([]);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_loans' | 'lab_desk'>('catalog');

  // Search & Filter in Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'microcontroller' | 'sensor' | 'actuator' | 'in_stock'>('all');

  // Lab Desk Status Filter (Faculty)
  const [labDeskFilter, setLabDeskFilter] = useState<'all' | 'pending' | 'active' | 'returned'>('pending');

  // User Profile
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [defaultName, setDefaultName] = useState('');
  const [defaultEnrollment, setDefaultEnrollment] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');

  // Modal State for Apply Form
  const [selectedSensor, setSelectedSensor] = useState<SensorItem | null>(null);
  const [studentName, setStudentName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState('7 Days');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch User Profile
  useEffect(() => {
    if (!token) return;
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.user?._id) setUserId(data.user._id);
          if (data.user?.email) setUserEmail(data.user.email);
          if (data.user?.role) {
            setUserRole(data.user.role);
            if (data.user.role === 'faculty' || data.user.role === 'admin') {
              setActiveTab('lab_desk');
            }
          }
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
      .catch((err) => console.log('Profile fetch note:', err.message));
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

      const srRes = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const srData = await srRes.json();
      if (srData.success) setAllRequests(srData.requests || []);
    } catch (err: any) {
      console.log('Sensor module fetch note:', err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchSensorsData();
  }, [fetchSensorsData]);

  // Filter requests belonging to the student
  const myRequests = useMemo(() => {
    if (!userId && !userEmail && !defaultEnrollment) return allRequests;
    return allRequests.filter((r) => {
      if (r.studentId && r.studentId === userId) return true;
      if (r.studentEmail && userEmail && r.studentEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      if (r.enrollmentNo && defaultEnrollment && r.enrollmentNo.toLowerCase() === defaultEnrollment.toLowerCase()) return true;
      return false;
    });
  }, [allRequests, userId, userEmail, defaultEnrollment]);

  // Filtered Catalog
  const filteredSensors = useMemo(() => {
    return sensors.filter((sensor) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        sensor.name.toLowerCase().includes(q) || 
        (sensor.department && sensor.department.toLowerCase().includes(q)) ||
        (sensor.type && sensor.type.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'in_stock') return sensor.availableQuantity > 0;
      if (selectedCategory === 'microcontroller') {
        const name = sensor.name.toLowerCase();
        return name.includes('esp') || name.includes('arduino') || name.includes('pico') || name.includes('stm') || name.includes('board');
      }
      if (selectedCategory === 'sensor') {
        const name = sensor.name.toLowerCase();
        return name.includes('sensor') || name.includes('dht') || name.includes('mq') || name.includes('ultrasonic') || name.includes('pir') || name.includes('ir');
      }
      if (selectedCategory === 'actuator') {
        const name = sensor.name.toLowerCase();
        return name.includes('relay') || name.includes('servo') || name.includes('motor') || name.includes('oled') || name.includes('display') || name.includes('module');
      }
      return true;
    });
  }, [sensors, searchQuery, selectedCategory]);

  // Filtered Lab Desk Requests (Faculty)
  const filteredLabDeskRequests = useMemo(() => {
    return allRequests.filter((req) => {
      if (labDeskFilter === 'pending') return req.status === 'pending';
      if (labDeskFilter === 'active') return req.status === 'approved' || req.status === 'issued';
      if (labDeskFilter === 'returned') return req.status === 'returned';
      return true;
    });
  }, [allRequests, labDeskFilter]);

  // Open Apply Modal
  const handleOpenApply = (sensor: SensorItem) => {
    setSelectedSensor(sensor);
    setStudentName(studentName || defaultName || '');
    setEnrollmentNo(enrollmentNo || defaultEnrollment || '');
    setBranch(branch || defaultBranch || '');
    setPhone(phone || defaultPhone || '');
    setDuration('7 Days');
    setPurpose('');
  };

  // Submit Application
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
        Alert.alert('Submitted', 'Your loan request has been sent for faculty approval.');
        setSelectedSensor(null);
        setPurpose('');
        setActiveTab('my_loans');
        fetchSensorsData(true);
      } else {
        Alert.alert('Notice', data.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      Alert.alert('Notice', 'Network error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Faculty Decision (Approve / Reject)
  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    setAllRequests((prev) =>
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
        fetchSensorsData(true);
      }
    } catch (_) {
      fetchSensorsData(true);
    }
  };

  // Handover / Mark Issued
  const handleIssue = async (requestId: string) => {
    setAllRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, status: 'issued' } : r))
    );

    try {
      const res = await fetch(`${backendUrl}/api/sensors-module/sensor-requests/${requestId}/issue`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchSensorsData(true);
      }
    } catch (_) {
      fetchSensorsData(true);
    }
  };

  // Mark Returned
  const handleReturn = async (requestId: string) => {
    setAllRequests((prev) =>
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
        fetchSensorsData(true);
      }
    } catch (_) {
      fetchSensorsData(true);
    }
  };

  // Status Badge Helper
  const getBadgeConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', bg: '#D1FAE5', color: '#065F46' };
      case 'issued':
        return { label: 'Active Loan', bg: '#ECFDF5', color: '#047857' };
      case 'returned':
        return { label: 'Returned', bg: '#F3F4F6', color: '#4B5563' };
      case 'rejected':
        return { label: 'Rejected', bg: '#FEE2E2', color: '#991B1B' };
      default:
        return { label: 'Pending', bg: '#FEF3C7', color: '#92400E' };
    }
  };

  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin';

  return (
    <View style={styles.card}>
      {/* Module Title Bar */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>🔬 IoT Sensor Rentals</Text>
          <Text style={styles.cardSubtitle}>ECE & IoT Lab Inventory • Room 302</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshIconBtn} 
          onPress={() => fetchSensorsData(true)}
        >
          <Text style={{ fontSize: 13 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Role-Aware Navigation Tabs (Clean 2-Tab Layout per role to prevent any overflow) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabBtnTxt, activeTab === 'catalog' && styles.tabBtnTxtActive]}>
            📦 Catalog ({sensors.length})
          </Text>
        </TouchableOpacity>
        
        {isFacultyOrAdmin ? (
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'lab_desk' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('lab_desk')}
          >
            <Text style={[styles.tabBtnTxt, activeTab === 'lab_desk' && styles.tabBtnTxtActive]}>
              🛠️ Lab Desk ({allRequests.filter(r => r.status === 'pending').length} New)
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'my_loans' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('my_loans')}
          >
            <Text style={[styles.tabBtnTxt, activeTab === 'my_loans' && styles.tabBtnTxtActive]}>
              📋 My Loans ({myRequests.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && sensors.length === 0 && (
        <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />
      )}

      {/* ==================== TAB 1: CATALOG ==================== */}
      {activeTab === 'catalog' && (
        <View style={{ marginTop: 4 }}>
          {/* Compact Search Box */}
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.searchInput}
              placeholder="🔍 Search sensors, ESP32, Arduino..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[
              { id: 'all', label: 'All' },
              { id: 'in_stock', label: 'In Stock' },
              { id: 'microcontroller', label: 'MCUs' },
              { id: 'sensor', label: 'Sensors' },
              { id: 'actuator', label: 'Modules' }
            ].map((pill) => (
              <TouchableOpacity
                key={pill.id}
                style={[
                  styles.filterPill,
                  selectedCategory === pill.id && styles.filterPillActive
                ]}
                onPress={() => setSelectedCategory(pill.id as any)}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedCategory === pill.id && styles.filterPillTextActive
                ]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minimalist Catalog Cards */}
          {filteredSensors.length === 0 ? (
            <Text style={styles.emptyText}>No sensors found matching your search.</Text>
          ) : (
            filteredSensors.map((sensor) => {
              const inStock = sensor.availableQuantity > 0;
              return (
                <View key={sensor._id} style={styles.sensorCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.sensorName} numberOfLines={1}>
                      {sensor.name}
                    </Text>
                    <Text style={styles.sensorSub} numberOfLines={1}>
                      {sensor.department || 'IoT Lab'} • {sensor.availableQuantity} of {sensor.totalQuantity} available
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.applyBtn, !inStock && styles.disabledBtn]} 
                    disabled={!inStock}
                    onPress={() => handleOpenApply(sensor)}
                  >
                    <Text style={styles.applyBtnTxt}>
                      {inStock ? 'Rent' : 'Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ==================== TAB 2: MY LOANS (STUDENT) ==================== */}
      {activeTab === 'my_loans' && (
        <View style={{ marginTop: 4 }}>
          {myRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Active Rental Loans</Text>
              <Text style={styles.emptyText}>
                You haven't requested any sensors yet. Browse the catalog to apply for lab hardware.
              </Text>
            </View>
          ) : (
            myRequests.map((req) => {
              const badge = getBadgeConfig(req.status);
              const sensorTitle = req.sensorId?.name || req.sensorName || 'Hardware Unit';

              return (
                <View key={req._id} style={styles.compactRequestCard}>
                  {/* Row 1: Sensor Name + Status Chip (No Overflow) */}
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle} numberOfLines={1} ellipsizeMode="tail">
                      {sensorTitle}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeTxt, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Row 2: Duration & Status Context */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      ⏱️ {req.duration}
                      {req.dueAt ? ` • Due: ${new Date(req.dueAt).toLocaleDateString()}` : ''}
                    </Text>
                  </View>

                  {/* Row 3: Actionable Guidance */}
                  {req.status === 'approved' && (
                    <Text style={styles.pickupHint}>
                      📍 Ready for pickup at IoT Lab Room 302
                    </Text>
                  )}
                  {req.status === 'pending' && (
                    <Text style={styles.pendingHint}>
                      ⏳ Awaiting faculty review
                    </Text>
                  )}
                  {req.status === 'rejected' && req.approvalNote ? (
                    <Text style={styles.rejectHint}>
                      Note: {req.approvalNote}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ==================== TAB 3: LAB DESK (FACULTY) ==================== */}
      {activeTab === 'lab_desk' && isFacultyOrAdmin && (
        <View style={{ marginTop: 4 }}>
          {/* Quick Status Filter Tabs */}
          <View style={styles.labFilterRow}>
            {(['pending', 'active', 'returned', 'all'] as const).map((filterKey) => (
              <TouchableOpacity
                key={filterKey}
                style={[styles.labFilterBtn, labDeskFilter === filterKey && styles.labFilterBtnActive]}
                onPress={() => setLabDeskFilter(filterKey)}
              >
                <Text style={[styles.labFilterBtnText, labDeskFilter === filterKey && styles.labFilterBtnTextActive]}>
                  {filterKey === 'pending' ? 'Pending' : filterKey === 'active' ? 'Active' : filterKey === 'returned' ? 'Returned' : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredLabDeskRequests.length === 0 ? (
            <Text style={styles.emptyText}>No requests in this category.</Text>
          ) : (
            filteredLabDeskRequests.map((req) => {
              const badge = getBadgeConfig(req.status);
              const sensorTitle = req.sensorId?.name || req.sensorName || 'Hardware Unit';

              return (
                <View key={req._id} style={styles.compactRequestCard}>
                  {/* Row 1: Sensor Name + Status Chip (Never goes off screen) */}
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle} numberOfLines={1} ellipsizeMode="tail">
                      {sensorTitle}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeTxt, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Row 2: Student & Duration Details */}
                  <Text style={styles.studentDetailText} numberOfLines={1}>
                    👤 {req.studentName} ({req.enrollmentNo}) • {req.duration}
                  </Text>
                  <Text style={styles.purposeText} numberOfLines={1}>
                    📝 {req.purpose}
                  </Text>

                  {/* Row 3: Action Buttons */}
                  {req.status === 'pending' && (
                    <View style={styles.facultyActionRow}>
                      <TouchableOpacity 
                        style={[styles.facultyBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleDecision(req._id, 'approved')}
                      >
                        <Text style={styles.facultyBtnTxt}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.facultyBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleDecision(req._id, 'rejected')}
                      >
                        <Text style={styles.facultyBtnTxt}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {req.status === 'approved' && (
                    <View style={styles.facultyActionRow}>
                      <TouchableOpacity 
                        style={[styles.facultyBtn, { backgroundColor: '#0284C7' }]}
                        onPress={() => handleIssue(req._id)}
                      >
                        <Text style={styles.facultyBtnTxt}>📦 Mark Handed Over</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {req.status === 'issued' && (
                    <View style={styles.facultyActionRow}>
                      <TouchableOpacity 
                        style={[styles.facultyBtn, { backgroundColor: '#059669' }]}
                        onPress={() => handleReturn(req._id)}
                      >
                        <Text style={styles.facultyBtnTxt}>🔄 Mark Returned</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ==================== CLEAN APPLY MODAL ==================== */}
      <Modal visible={!!selectedSensor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rent Sensor</Text>
              <TouchableOpacity onPress={() => setSelectedSensor(null)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSensor && (
              <View style={styles.selectedSensorHighlight}>
                <Text style={styles.selectedSensorName}>{selectedSensor.name}</Text>
                <Text style={styles.selectedSensorStock}>
                  Available: {selectedSensor.availableQuantity} of {selectedSensor.totalQuantity}
                </Text>
              </View>
            )}

            <ScrollView style={{ maxHeight: 300, marginVertical: 6 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Student Name *</Text>
              <TextInput 
                style={styles.input} 
                value={studentName} 
                onChangeText={setStudentName} 
              />

              <Text style={styles.label}>Enrollment No. *</Text>
              <TextInput 
                style={styles.input} 
                value={enrollmentNo} 
                onChangeText={setEnrollmentNo} 
              />

              <Text style={styles.label}>Duration *</Text>
              <View style={styles.durationRow}>
                {['3 Days', '7 Days', '14 Days'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durationChip, duration === d && styles.durationChipActive]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Purpose *</Text>
              <TextInput 
                style={[styles.input, { height: 55, textAlignVertical: 'top' }]} 
                placeholder="Lab or project purpose..." 
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
                <Text style={{ fontWeight: 'bold', color: '#374151', fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#10B981' }]} 
                disabled={submitting}
                onPress={handleSubmitApply}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 12 }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
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
    fontWeight: '700',
    color: '#6B7280',
  },
  tabBtnTxtActive: {
    color: '#065F46',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 11,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 5,
  },
  filterPillActive: {
    backgroundColor: '#064E3B',
  },
  filterPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  sensorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  sensorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  sensorSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  applyBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#E5E7EB',
  },
  applyBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  compactRequestCard: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardHeaderTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
  },
  pickupHint: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
    marginTop: 3,
  },
  pendingHint: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 3,
  },
  rejectHint: {
    fontSize: 10,
    color: '#991B1B',
    marginTop: 3,
  },
  studentDetailText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginTop: 2,
  },
  purposeText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  facultyActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  facultyBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultyBtnTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  labFilterRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  labFilterBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  labFilterBtnActive: {
    backgroundColor: '#064E3B',
  },
  labFilterBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  labFilterBtnTextActive: {
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  selectedSensorHighlight: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  selectedSensorName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  selectedSensorStock: {
    fontSize: 9,
    color: '#047857',
    marginTop: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    marginTop: 5,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 2,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  durationChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  durationChipText: {
    fontSize: 9,
    color: '#4B5563',
    fontWeight: '600',
  },
  durationChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
});
