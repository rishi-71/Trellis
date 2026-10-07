import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking
} from 'react-native';
import { io, Socket } from 'socket.io-client';

export type EmergencyType = 'security' | 'anti-ragging' | 'medical' | 'fire';

interface SOSProps {
  token: string;
  backendUrl: string;
  userRole?: 'student' | 'faculty' | 'admin' | 'management' | string | null;
}

interface ActiveSOSAlert {
  _id: string;
  student: {
    _id: string;
    email: string;
    name?: string;
    role?: string;
  };
  location: string;
  emergencyType?: EmergencyType;
  status: 'active' | 'resolved';
  createdAt: string;
  timestamp?: string;
}

// Emergency Contacts Directory categorized by Incident Type
const EMERGENCY_CONTACTS: Record<
  EmergencyType,
  { title: string; subtitle: string; icon: string; color: string; contacts: { role: string; name: string; phone: string; note: string }[] }
> = {
  security: {
    title: 'Campus Security & Protection',
    subtitle: 'Immediate guard dispatch for physical threats, harassment, or night transit.',
    icon: '🛡️',
    color: '#DC2626',
    contacts: [
      { role: 'Chief Security Officer (CSO)', name: 'Col. R. K. Joshi', phone: '+91-9876543210', note: '24/7 Security Control Room' },
      { role: 'Main Gate 1 & 2 Guard Post', name: 'Duty Inspector Desk', phone: '+91-9876543215', note: 'Campus Entrance Rapid Response' },
      { role: 'National Police Control', name: 'Dial 112', phone: '112', note: 'Immediate Police & PCR Van' }
    ]
  },
  'anti-ragging': {
    title: 'Anti-Ragging Squad & Committee',
    subtitle: 'Confidential protection against senior harassment, bullying, or hostel coercion.',
    icon: '🚫',
    color: '#7C3AED',
    contacts: [
      { role: 'Anti-Ragging Committee Head', name: 'Dr. S. K. Bansal', phone: '+91-9876543220', note: 'Strict Confidential Action Desk' },
      { role: 'National Anti-Ragging Helpline', name: 'UGC Toll-Free 24x7', phone: '18001805522', note: 'Zero-Tolerance National Helpline' },
      { role: 'Dean of Student Affairs (DSW)', name: 'Prof. Anjali Mehta', phone: '+91-9876543222', note: 'Campus Proctorial Authority' },
      { role: 'Hostel Chief Warden', name: 'Hostel Security Cell', phone: '+91-9876543225', note: 'Resident Block Squad' }
    ]
  },
  medical: {
    title: 'Medical Health Center & Ambulance',
    subtitle: 'Immediate medical assistance for acute trauma, fainting, or health emergencies.',
    icon: '🚑',
    color: '#059669',
    contacts: [
      { role: 'Campus Health Center', name: 'Dr. Neha Verma (RMO)', phone: '+91-9876543230', note: 'Campus Infirmary & Emergency Kit' },
      { role: 'Emergency Ambulance', name: 'Govt. Ambulance 108', phone: '108', note: 'On-Call Campus Ambulance' },
      { role: 'Nearest Trauma Hospital', name: 'Indore City Hospital Desk', phone: '07312555555', note: 'Emergency ICU & Casualty' }
    ]
  },
  fire: {
    title: 'Disaster & Fire Safety Cell',
    subtitle: 'Chemical lab hazard, electrical fire, or building evacuation protocol.',
    icon: '🔥',
    color: '#EA580C',
    contacts: [
      { role: 'Campus Fire Safety Officer', name: 'Mr. Arvind Saxena', phone: '+91-9876543240', note: 'Safety & Extinguisher Squad' },
      { role: 'Fire Emergency Dispatch', name: 'National Fire 101', phone: '101', note: 'Indore Fire Brigade Station' }
    ]
  }
};

const COMMON_LOCATIONS = [
  'B.Tech Block B Entrance',
  'Vehicle Parking Area',
  'Architecture Building',
  'Gate No. 2 Main Entrance',
  'Central Library (4th Floor)',
  'Computer Lab 1 (1st Floor)',
  'Auditorium Foyer'
];

export default function SOSModule({ token, backendUrl, userRole }: SOSProps) {
  // Mode switcher: 'panic' (student emergency) vs 'queue' (officer/faculty response)
  const isAuthority = userRole === 'faculty' || userRole === 'admin' || userRole === 'management';
  const [activeTab, setActiveTab] = useState<'panic' | 'queue'>(isAuthority ? 'queue' : 'panic');

  // Emergency Form State
  const [selectedType, setSelectedType] = useState<EmergencyType>('security');
  const [location, setLocation] = useState('B.Tech Block B Entrance');
  const [loading, setLoading] = useState(false);

  // Countdown & Active Beacon State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeAlertDispatched, setActiveAlertDispatched] = useState(false);
  const [lastDispatchedTime, setLastDispatchedTime] = useState<string | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Active Incidents Queue (Security / Faculty desk)
  const [activeAlerts, setActiveAlerts] = useState<ActiveSOSAlert[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // 1. Fetch Active Incidents Queue
  const fetchActiveAlerts = async () => {
    if (!token) return;
    setLoadingQueue(true);
    try {
      const res = await fetch(`${backendUrl}/api/sos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setActiveAlerts(data.alerts);
      }
    } catch {
      console.log('Failed to fetch active alerts');
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue' || isAuthority) {
      fetchActiveAlerts();
    }
  }, [activeTab, token]);

  // 2. Real-Time Socket.IO Alert Listener
  useEffect(() => {
    if (!token) return;
    const socket = io(backendUrl, { query: { token } });
    socketRef.current = socket;

    socket.on('sos:alert', (newAlert: ActiveSOSAlert) => {
      setActiveAlerts((prev) => [newAlert, ...prev.filter((a) => a._id !== newAlert._id)]);
      Alert.alert(
        '🚨 EMERGENCY ALERT RECEIVED',
        `Incident: ${newAlert.emergencyType?.toUpperCase() || 'SECURITY'}\nStudent: ${newAlert.student?.name || newAlert.student?.email}\nLocation: ${newAlert.location}`
      );
    });

    socket.on('sos:resolved', (resolvedAlert: ActiveSOSAlert) => {
      setActiveAlerts((prev) => prev.filter((a) => a._id !== resolvedAlert._id));
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl, token]);

  // 3. Initiate Panic Countdown (3-second safety window to abort accidental taps)
  const handleStartPanicCountdown = () => {
    if (!location.trim()) {
      Alert.alert('Required', 'Please specify your location on campus.');
      return;
    }
    setCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          dispatchEmergencySOS();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAbortCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  // 4. Send SOS Alert to Backend & Socket
  const dispatchEmergencySOS = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          location: location.trim(),
          emergencyType: selectedType
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveAlertDispatched(true);
        setLastDispatchedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        Alert.alert(
          '🚨 EMERGENCY ALARM BROADCAST',
          `Security Officers, Faculty proctors, and the ${EMERGENCY_CONTACTS[selectedType].title} have received your location: ${location}. Stay in a safe area.`
        );
      } else {
        Alert.alert('Error', data.message || 'Could not dispatch alert.');
      }
    } catch {
      Alert.alert('Connection Error', 'Failed to reach security dispatch server.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Direct Phone Call Action
  const handleCallNumber = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Call', `Please dial ${phone} on your phone.`);
        }
      })
      .catch(() => {
        Alert.alert('Call', `Please dial ${phone} on your phone.`);
      });
  };

  // 6. Resolve Incident Action (Authority / Officer)
  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/sos/${id}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Incident Resolved', 'Alert marked as resolved.');
        setActiveAlerts((prev) => prev.filter((a) => a._id !== id));
      }
    } catch {
      Alert.alert('Error', 'Could not resolve alert.');
    }
  };

  const currentCategory = EMERGENCY_CONTACTS[selectedType];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.sosLiveBadge}>🚨 CAMPUS SAFETY NETWORK</Text>
            <Text style={styles.sosStatusBadge}>24/7 Security Active</Text>
          </View>
          <Text style={styles.title}>Emergency SOS Dispatch</Text>
          <Text style={styles.subtitle}>
            Immediate assistance, anti-ragging squad, and security dispatch.
          </Text>
        </View>

        {/* View Switcher Pill */}
        <View style={styles.tabToggleGroup}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'panic' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('panic')}
          >
            <Text style={[styles.tabToggleText, activeTab === 'panic' && styles.tabToggleTextActive]}>
              🚨 Panic SOS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'queue' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={[styles.tabToggleText, activeTab === 'queue' && styles.tabToggleTextActive]}>
              📋 Live Queue ({activeAlerts.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= TAB 1: STUDENT PANIC SOS ================= */}
        {activeTab === 'panic' && (
          <>
            {/* Active Beacon Banner (If Alert was already fired) */}
            {activeAlertDispatched && (
              <View style={styles.beaconBanner}>
                <View style={styles.beaconHeaderRow}>
                  <View style={styles.beaconPulseDot} />
                  <Text style={styles.beaconTitle}>EMERGENCY ALERT BROADCASTED</Text>
                  <Text style={styles.beaconTime}>{lastDispatchedTime}</Text>
                </View>
                <Text style={styles.beaconText}>
                  Officers & committee squads have been notified at: <Text style={{ fontWeight: '900', color: '#FFF' }}>{location}</Text>.
                </Text>
                <TouchableOpacity
                  style={styles.cancelAlertBtn}
                  onPress={() => {
                    setActiveAlertDispatched(false);
                    Alert.alert('Status Updated', 'Emergency beacon reset. Stay safe.');
                  }}
                >
                  <Text style={styles.cancelAlertBtnText}>I Am Safe Now (Dismiss Beacon)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Emergency Type Selector */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>1. What type of emergency is this?</Text>
              <Text style={styles.sectionSubtitle}>
                Categorizing ensures the right team (Security, Anti-Ragging Committee, or Medical) responds immediately.
              </Text>

              <View style={styles.typeGrid}>
                {[
                  { id: 'security' as EmergencyType, label: 'Campus Security', desc: 'Harassment & Threat', icon: '🛡️', color: '#DC2626' },
                  { id: 'anti-ragging' as EmergencyType, label: 'Anti-Ragging Squad', desc: 'Bullying & Coercion', icon: '🚫', color: '#7C3AED' },
                  { id: 'medical' as EmergencyType, label: 'Medical Emergency', desc: 'Injury & Trauma', icon: '🚑', color: '#059669' },
                  { id: 'fire' as EmergencyType, label: 'Fire & Lab Hazard', desc: 'Chemical & Electrical', icon: '🔥', color: '#EA580C' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.typeCard,
                      selectedType === item.id && { borderColor: item.color, backgroundColor: `${item.color}0D` }
                    ]}
                    onPress={() => setSelectedType(item.id)}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text style={[styles.typeLabel, selectedType === item.id && { color: item.color, fontWeight: '900' }]}>
                      {item.label}
                    </Text>
                    <Text style={styles.typeDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Panic Button Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>2. Transmit Live SOS Alarm</Text>
              <Text style={styles.sectionSubtitle}>
                Pressing the button immediately alerts on-duty campus guards, committee heads, and faculty desks.
              </Text>

              {/* Location Input with Quick Chips */}
              <Text style={styles.inputLabel}>Your Campus Location:</Text>
              <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter current block, room, or landmark..."
                placeholderTextColor="#94A3B8"
              />

              {/* Quick Location Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationChipsScroll}>
                {COMMON_LOCATIONS.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.locChip, location === loc && styles.locChipActive]}
                    onPress={() => setLocation(loc)}
                  >
                    <Text style={[styles.locChipText, location === loc && styles.locChipTextActive]}>
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Big Panic Button with Countdown Handler */}
              <View style={styles.panicButtonWrapper}>
                {countdown !== null ? (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownNumber}>{countdown}</Text>
                    <Text style={styles.countdownNotice}>DISPATCHING ALERT IN {countdown}s...</Text>
                    <TouchableOpacity style={styles.abortBtn} onPress={handleAbortCountdown}>
                      <Text style={styles.abortBtnText}>✕ CANCEL DISPATCH</Text>
                    </TouchableOpacity>
                  </View>
                ) : loading ? (
                  <ActivityIndicator size="large" color="#DC2626" style={{ marginVertical: 30 }} />
                ) : (
                  <TouchableOpacity
                    style={[styles.sosButton, { backgroundColor: currentCategory.color }]}
                    onPress={handleStartPanicCountdown}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sosPulseRing} />
                    <Text style={styles.sosButtonText}>SOS</Text>
                    <Text style={styles.sosButtonSub}>TAP FOR HELP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Dedicated Emergency Helplines Card (Context-Aware) */}
            <View style={styles.card}>
              <View style={styles.helplineHeaderRow}>
                <Text style={styles.typeIconSmall}>{currentCategory.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helplineTitle}>{currentCategory.title} Helplines</Text>
                  <Text style={styles.helplineSub}>{currentCategory.subtitle}</Text>
                </View>
              </View>

              <View style={styles.contactList}>
                {currentCategory.contacts.map((contact, idx) => (
                  <View key={idx} style={styles.contactCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactRole}>{contact.role}</Text>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactNote}>{contact.note}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.callBtn, { backgroundColor: currentCategory.color }]}
                      onPress={() => handleCallNumber(contact.phone)}
                    >
                      <Text style={styles.callBtnIcon}>📞</Text>
                      <Text style={styles.callBtnText}>Call Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ================= TAB 2: ACTIVE INCIDENTS QUEUE (SECURITY DESK) ================= */}
        {activeTab === 'queue' && (
          <View style={styles.card}>
            <View style={styles.queueHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Active Emergency Incidents</Text>
                <Text style={styles.sectionSubtitle}>
                  Real-time incoming SOS broadcasts monitored by Security & Faculty.
                </Text>
              </View>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchActiveAlerts}>
                <Text style={{ fontSize: 13 }}>🔄</Text>
              </TouchableOpacity>
            </View>

            {loadingQueue && (
              <ActivityIndicator size="small" color="#DC2626" style={{ marginVertical: 12 }} />
            )}

            {activeAlerts.length === 0 ? (
              <View style={styles.emptyQueueBox}>
                <Text style={styles.emptyQueueIcon}>✅</Text>
                <Text style={styles.emptyQueueTitle}>All Clear on Campus</Text>
                <Text style={styles.emptyQueueSub}>
                  No active SOS emergency distress alerts at this moment.
                </Text>
              </View>
            ) : (
              activeAlerts.map((alert) => {
                const alertType = alert.emergencyType || 'security';
                const meta = EMERGENCY_CONTACTS[alertType];

                return (
                  <View key={alert._id} style={styles.alertCard}>
                    <View style={styles.alertTopRow}>
                      <View style={[styles.alertTypeBadge, { backgroundColor: `${meta.color}15`, borderColor: meta.color }]}>
                        <Text style={[styles.alertTypeText, { color: meta.color }]}>
                          {meta.icon} {meta.title.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.alertTime}>
                        {new Date(alert.createdAt || alert.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    <Text style={styles.alertStudent}>
                      Student: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{alert.student?.name || alert.student?.email || 'Student'}</Text>
                    </Text>
                    <Text style={styles.alertLocation}>
                      📍 Location: <Text style={{ fontWeight: '800', color: '#DC2626' }}>{alert.location}</Text>
                    </Text>

                    <View style={styles.alertActionRow}>
                      <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={() => handleResolveAlert(alert._id)}
                      >
                        <Text style={styles.resolveBtnText}>✓ Mark as Resolved</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  sosLiveBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  sosStatusBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },

  tabToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
    marginTop: 10
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center'
  },
  tabToggleBtnActive: {
    backgroundColor: '#DC2626'
  },
  tabToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  tabToggleTextActive: {
    color: '#FFF',
    fontWeight: '800'
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 15
  },

  // Beacon Mode
  beaconBanner: {
    backgroundColor: '#991B1B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DC2626'
  },
  beaconHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  beaconPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCA5A5'
  },
  beaconTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    color: '#FEE2E2',
    letterSpacing: 0.5
  },
  beaconTime: {
    fontSize: 11,
    color: '#FECACA',
    fontWeight: '800'
  },
  beaconText: {
    fontSize: 12,
    color: '#FEE2E2',
    lineHeight: 16,
    marginBottom: 10
  },
  cancelAlertBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelAlertBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },

  // Emergency Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  typeCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  typeIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B'
  },
  typeDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2
  },

  // Panic Form
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  locationInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10
  },
  locationChipsScroll: {
    flexDirection: 'row',
    marginBottom: 16
  },
  locChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  locChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  locChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  locChipTextActive: {
    color: '#DC2626',
    fontWeight: '800'
  },

  // Panic Button
  panicButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFF'
  },
  sosPulseRing: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.3)'
  },
  sosButtonText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1
  },
  sosButtonSub: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FEE2E2',
    marginTop: 2
  },

  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 10
  },
  countdownNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#DC2626'
  },
  countdownNotice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#991B1B',
    marginBottom: 12,
    letterSpacing: 0.5
  },
  abortBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  abortBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900'
  },

  // Helplines
  helplineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  typeIconSmall: {
    fontSize: 26
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A'
  },
  helplineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  contactList: {
    gap: 8
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8
  },
  contactRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase'
  },
  contactName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1
  },
  contactNote: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  callBtnIcon: {
    fontSize: 12
  },
  callBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },

  // Active Queue
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  emptyQueueBox: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emptyQueueIcon: {
    fontSize: 32,
    marginBottom: 6
  },
  emptyQueueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  emptyQueueSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  alertTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  alertTypeText: {
    fontSize: 9,
    fontWeight: '900'
  },
  alertTime: {
    fontSize: 10,
    color: '#991B1B',
    fontWeight: '700'
  },
  alertStudent: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 2
  },
  alertLocation: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 10
  },
  alertActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  resolveBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  resolveBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  }
});
