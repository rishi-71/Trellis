import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { globalState } from '@/constants/globalState';

export default function ExploreScreen() {
  const [token, setToken] = useState<string | null>(globalState.token);
  const [ipAddress, setIpAddress] = useState(globalState.ipAddress);
  const [loading, setLoading] = useState(false);

  // Data States
  const [events, setEvents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'activities'>('events');

  // Log Activity Form States
  const [showLogForm, setShowLogForm] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actType, setActType] = useState('certification'); // certification, hackathon, sports, etc.
  const [actDesc, setActDesc] = useState('');
  const [actDate, setActDate] = useState('2026-08-19');

  // Subscribe to global state
  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setToken(globalState.token);
      setIpAddress(globalState.ipAddress);
    });
    return unsubscribe;
  }, []);
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err: any) {
      console.log('Error fetching events:', err.message);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/activities/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err: any) {
      console.log('Error fetching activities:', err.message);
    }
  };

  // Fetch data when token or IP changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) {
        fetchEvents();
        fetchActivities();
      } else {
        setEvents([]);
        setActivities([]);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [token, ipAddress]);

  const backendUrl = globalState.backendUrl;



  const handleRegisterEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Registered for event successfully!');
        fetchEvents(); // reload events list
      } else {
        Alert.alert('Registration Failed', data.message || 'Already registered or deadline passed.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection error registering for event.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!actTitle) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/activities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: actTitle,
          type: actType,
          description: actDesc,
          date: new Date(actDate)
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Activity logged! Awaiting faculty verification.');
        setActTitle('');
        setActDesc('');
        setShowLogForm(false);
        fetchActivities();
      } else {
        Alert.alert('Error', data.message || 'Could not log activity');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection error logging activity.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.warnTitle}>Access Restrained</Text>
        <Text style={styles.warnText}>
          Please navigate to the **Profile** tab, connect to the backend server, and log in to view events and log activities.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Tabs Toggle */}
      <View style={styles.tabToggleRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, activeTab === 'events' && styles.toggleBtnActive]} 
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.toggleBtnText, activeTab === 'events' && styles.toggleBtnTextActive]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, activeTab === 'activities' && styles.toggleBtnActive]} 
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.toggleBtnText, activeTab === 'activities' && styles.toggleBtnTextActive]}>
            My Activities
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#1F2937" style={styles.loader} />}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Events View */}
        {activeTab === 'events' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Campus Events</Text>
            {events.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming campus events listed.</Text>
            ) : (
              events.map((event) => (
                <View key={event._id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDesc}>{event.description}</Text>
                  <Text style={styles.eventDetail}>📍 Venue: {event.venue}</Text>
                  <Text style={styles.eventDetail}>📅 Date: {new Date(event.date).toLocaleDateString()}</Text>
                  
                  <TouchableOpacity 
                    style={styles.eventBtn}
                    onPress={() => handleRegisterEvent(event._id)}
                  >
                    <Text style={styles.eventBtnText}>Register Now</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* 2. Activities View */}
        {activeTab === 'activities' && (
          <View style={styles.sectionContainer}>
            <View style={styles.actHeaderRow}>
              <Text style={styles.sectionHeader}>Logged Activities</Text>
              <TouchableOpacity 
                style={styles.addActBtn}
                onPress={() => setShowLogForm(!showLogForm)}
              >
                <Text style={styles.addActBtnText}>{showLogForm ? 'Close Form' : '+ Log New'}</Text>
              </TouchableOpacity>
            </View>

            {/* Log Activity Form */}
            {showLogForm && (
              <View style={styles.logFormCard}>
                <Text style={styles.logFormTitle}>Log Achievement / Activity</Text>
                
                <TextInput 
                  style={styles.input}
                  placeholder="Activity Title (e.g. Smart India Hackathon)"
                  value={actTitle}
                  onChangeText={setActTitle}
                />

                <View style={styles.typeSelectorRow}>
                  {['certification', 'hackathon', 'sports'].map((type) => (
                    <TouchableOpacity 
                      key={type}
                      style={[styles.typeBtn, actType === type && styles.typeBtnActive]}
                      onPress={() => setActType(type)}
                    >
                      <Text style={[styles.typeBtnText, actType === type && styles.typeBtnTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput 
                  style={[styles.input, styles.textArea]}
                  placeholder="Activity Details / Description"
                  value={actDesc}
                  onChangeText={setActDesc}
                  multiline
                  numberOfLines={2}
                />

                <TextInput 
                  style={styles.input}
                  placeholder="Date Completed (YYYY-MM-DD)"
                  value={actDate}
                  onChangeText={setActDate}
                />

                <TouchableOpacity style={styles.submitActBtn} onPress={handleLogActivity}>
                  <Text style={styles.submitActBtnText}>Submit Achievement</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Activities List */}
            {activities.length === 0 ? (
              <Text style={styles.emptyText}>You haven{"'"}t logged any activities yet.</Text>
            ) : (
              activities.map((act) => (
                <View key={act._id} style={styles.actCard}>
                  <View style={styles.actHeader}>
                    <Text style={styles.actTitle}>{act.title}</Text>
                    <View style={[
                      styles.statusBadge, 
                      act.verificationStatus === 'verified' && styles.statusVerified,
                      act.verificationStatus === 'rejected' && styles.statusRejected
                    ]}>
                      <Text style={styles.statusText}>{act.verificationStatus}</Text>
                    </View>
                  </View>
                  <Text style={styles.actDesc}>{act.description}</Text>
                  <View style={styles.actFooter}>
                    <Text style={styles.actType}>Category: {act.type}</Text>
                    {act.verificationStatus === 'verified' && (
                      <Text style={styles.actPoints}>🏆 Awarded: {act.pointsAwarded} pts</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    backgroundColor: '#F4FBF7',
  },
  warnTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  warnText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#059669',
  },
  toggleBtnTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 12,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.three,
  },
  emptyText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  // Event card
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  eventDesc: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 6,
  },
  eventDetail: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  eventBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  eventBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Activity Styles
  actHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  addActBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addActBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logFormCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  logFormTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    marginBottom: 8,
    color: '#000',
  },
  textArea: {
    height: 50,
    textAlignVertical: 'top',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  typeBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#374151',
  },
  typeBtnText: {
    fontSize: 12,
    color: '#374151',
  },
  typeBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  submitActBtn: {
    backgroundColor: '#10B981', // green-500
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitActBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Act Card
  actCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  actHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#064E3B',
    flex: 1,
    marginRight: 8,
  },
  actDesc: {
    fontSize: 13,
    color: '#374151',
    marginVertical: 4,
  },
  actFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  actType: {
    fontSize: 11,
    color: '#059669',
  },
  actPoints: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F4FBF7', // grey
  },
  statusVerified: {
    backgroundColor: '#D1FAE5', // light green
  },
  statusRejected: {
    backgroundColor: '#FEE2E2', // light red
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#374151',
  }
});
