import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface ComplaintsProps {
  token: string;
  backendUrl: string;
  userRole?: string | null;
}

export default function ComplaintsModule({ token, backendUrl, userRole }: ComplaintsProps) {
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  
  // Student form states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintLocation, setComplaintLocation] = useState('');
  const [complaintCat, setComplaintCat] = useState('wifi');
  const [complaintDesc, setComplaintDesc] = useState('');

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  // Management Action Modal states
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [actionModalType, setActionModalType] = useState<'start_work' | 'resolve' | null>(null);
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [mgmtResolutionNotes, setMgmtResolutionNotes] = useState('');

  const isManagement = userRole === 'management' || userRole === 'admin';

  const categories = [
    { id: 'wifi', label: '📶 Wi-Fi / Net' },
    { id: 'washroom', label: '🚾 Washroom' },
    { id: 'projector', label: '📽️ Projector' },
    { id: 'electrical', label: '⚡ Electrical' },
    { id: 'water', label: '💧 Water Dispenser' },
    { id: 'cleaning', label: '🧹 Housekeeping' },
    { id: 'lab_hardware', label: '🖥️ Lab PC' },
    { id: 'other', label: '📦 Other' }
  ];

  const fetchComplaints = useCallback(async () => {
    try {
      const endpoint = isManagement 
        ? `${backendUrl}/api/complaints` 
        : `${backendUrl}/api/complaints/my`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err: any) {
      console.log('Error fetching complaints:', err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, isManagement]);

  // Dynamic real-time polling every 5 seconds
  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const handleFileComplaint = async () => {
    if (!complaintTitle || !complaintLocation || !complaintDesc) {
      Alert.alert('Error', 'Please fill in Title, Location, and Description of the issue.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/complaints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: complaintTitle,
          location: complaintLocation,
          category: complaintCat, 
          description: complaintDesc 
        })
      });
      const data = await res.json();
      if (data.success) {
        setComplaintTitle('');
        setComplaintLocation('');
        setComplaintDesc('');
        Alert.alert('Success', 'Complaint ticket submitted to Management Desk!');
        fetchComplaints();
      } else {
        Alert.alert('Error', data.message || 'Failed to file support request');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to file support request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !actionModalType) return;
    
    if (actionModalType === 'start_work' && !assignedTechnician) {
      Alert.alert('Error', 'Please specify the assigned technician or staff.');
      return;
    }

    if (actionModalType === 'resolve' && !mgmtResolutionNotes) {
      Alert.alert('Error', 'Please provide resolution notes.');
      return;
    }

    setLoading(true);
    try {
      const targetStatus = actionModalType === 'start_work' ? 'in_progress' : 'resolved';
      const res = await fetch(`${backendUrl}/api/complaints/${selectedComplaint._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatus,
          assignedTo: assignedTechnician || selectedComplaint.assignedTo,
          resolutionNotes: mgmtResolutionNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert(
          'Success', 
          targetStatus === 'in_progress' 
            ? 'Work marked as ongoing and technician assigned!' 
            : 'Ticket marked as resolved!'
        );
        setActionModalType(null);
        setSelectedComplaint(null);
        setAssignedTechnician('');
        setMgmtResolutionNotes('');
        fetchComplaints();
      } else {
        Alert.alert('Error', data.message || 'Failed to update complaint status');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'in_progress') {
      return { label: '🔵 Work Ongoing', bg: '#EFF6FF', color: '#1D4ED8' };
    }
    if (status === 'resolved') {
      return { label: '🟢 Work Completed', bg: '#ECFDF5', color: '#047857' };
    }
    return { label: '🟡 Pending Review', bg: '#FEF9C3', color: '#854D0E' };
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two }}>
        <Text style={styles.cardTitle}>🔧 Campus Facility Complaints</Text>
        {isManagement && (
          <View style={styles.mgmtPill}>
            <Text style={styles.mgmtPillTxt}>Management Desk</Text>
          </View>
        )}
      </View>

      {/* Student Ticket Filing Form */}
      {!isManagement && (
        <View>
          <Text style={styles.label}>File Maintenance Complaint</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Issue Title (e.g. AC not cooling in Room 304) *"
            value={complaintTitle}
            onChangeText={setComplaintTitle}
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Location / Classroom (e.g. Block B, 3rd Floor Lab) *"
            value={complaintLocation}
            onChangeText={setComplaintLocation}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.label, { marginTop: 4 }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.catBtn, complaintCat === cat.id && styles.catBtnActive]}
                onPress={() => setComplaintCat(cat.id)}
              >
                <Text style={[styles.catBtnTxt, complaintCat === cat.id && styles.catBtnTxtActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 4 }]}>Description & Specific Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the maintenance or repair needed in detail... *"
            value={complaintDesc}
            onChangeText={setComplaintDesc}
            multiline
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFileComplaint} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Submit Support Ticket'}</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

          <View style={styles.divider} />
        </View>
      )}

      {/* Filter Tabs */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.sectionSub}>
            {isManagement ? 'Campus Maintenance Requests' : 'My Active Case Tickets'} ({filteredComplaints.length})
          </Text>
          <Text style={{ fontSize: 10, color: '#10B981', fontWeight: 'bold' }}>● Real-time</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]} 
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillTxt, filter === 'all' && styles.filterPillTxtActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'pending' && styles.filterPillActive]} 
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterPillTxt, filter === 'pending' && styles.filterPillTxtActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'in_progress' && styles.filterPillActive]} 
            onPress={() => setFilter('in_progress')}
          >
            <Text style={[styles.filterPillTxt, filter === 'in_progress' && styles.filterPillTxtActive]}>Ongoing</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'resolved' && styles.filterPillActive]} 
            onPress={() => setFilter('resolved')}
          >
            <Text style={[styles.filterPillTxt, filter === 'resolved' && styles.filterPillTxtActive]}>Completed</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Text style={styles.emptyText}>No tickets found under this filter.</Text>
      ) : (
        filteredComplaints.map((c, idx) => {
          const badge = getStatusBadge(c.status);
          const studentInfo = c.student?.name ? `${c.student.name} (${c.student.email})` : (c.student?.email || 'Student');
          return (
            <View key={c._id || idx} style={styles.itemRow}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.catBadge}>
                    {(c.category || 'other').toUpperCase()}
                  </Text>
                  <Text style={[styles.statusBadge, { backgroundColor: badge.bg, color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemBold}>{c.title || c.description}</Text>
              {c.title ? <Text style={styles.itemSub}>{c.description}</Text> : null}
              
              <Text style={styles.metaTxt}>📍 {c.location || 'Campus Location'}</Text>
              {isManagement && (
                <Text style={styles.metaTxt}>👤 Reported by: {studentInfo}</Text>
              )}

              {/* In Progress Details */}
              {c.status === 'in_progress' && (
                <View style={styles.ongoingBox}>
                  <Text style={styles.ongoingTitle}>🔧 Assigned Technician: {c.assignedTo || 'Facility Support Staff'}</Text>
                  {c.resolutionNotes ? (
                    <Text style={styles.ongoingNotes}>📝 Progress Notes: {c.resolutionNotes}</Text>
                  ) : null}
                </View>
              )}

              {/* Resolved Details */}
              {c.status === 'resolved' && (
                <View style={styles.resolvedBox}>
                  <Text style={styles.resolvedTitle}>✅ Work Completed by: {c.assignedTo || 'Management Team'}</Text>
                  {c.resolutionNotes ? (
                    <Text style={styles.resolvedNotes}>📝 Resolution Summary: {c.resolutionNotes}</Text>
                  ) : null}
                  {c.resolvedAt ? (
                    <Text style={styles.resolvedDate}>📅 Completed on: {new Date(c.resolvedAt).toLocaleDateString()}</Text>
                  ) : null}
                </View>
              )}

              {/* Management Action Buttons */}
              {isManagement && (
                <View style={styles.actionsContainer}>
                  {c.status === 'pending' && (
                    <TouchableOpacity 
                      style={styles.startWorkBtn}
                      onPress={() => {
                        setSelectedComplaint(c);
                        setAssignedTechnician('');
                        setMgmtResolutionNotes('');
                        setActionModalType('start_work');
                      }}
                    >
                      <Text style={styles.startWorkBtnTxt}>🛠️ Start Work / Assign Technician</Text>
                    </TouchableOpacity>
                  )}

                  {c.status === 'in_progress' && (
                    <TouchableOpacity 
                      style={styles.resolveBtn}
                      onPress={() => {
                        setSelectedComplaint(c);
                        setAssignedTechnician(c.assignedTo || '');
                        setMgmtResolutionNotes('');
                        setActionModalType('resolve');
                      }}
                    >
                      <Text style={styles.resolveBtnTxt}>✅ Mark Work Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      {/* MODAL: Management Action Dialog */}
      <Modal visible={actionModalType !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionModalType === 'start_work' ? '🛠️ Assign Technician & Start Work' : '✅ Mark Ticket as Completed'}
            </Text>
            <Text style={styles.modalSubtitle}>Ticket: {selectedComplaint?.title || selectedComplaint?.description}</Text>

            {actionModalType === 'start_work' ? (
              <View>
                <Text style={styles.modalLabel}>Assigned Technician / Staff *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rajesh Kumar (Electrical Dept)"
                  value={assignedTechnician}
                  onChangeText={setAssignedTechnician}
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.modalLabel}>Initial Work Notes / Estimated Time</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Parts dispatched. Repair scheduled for 2:00 PM today."
                  value={mgmtResolutionNotes}
                  onChangeText={setMgmtResolutionNotes}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ) : (
              <View>
                <Text style={styles.modalLabel}>Resolution Summary / Remarks *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Wiring replaced and socket tested. Problem fully resolved."
                  value={mgmtResolutionNotes}
                  onChangeText={setMgmtResolutionNotes}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} 
                onPress={() => {
                  setActionModalType(null);
                  setSelectedComplaint(null);
                }}
              >
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  { backgroundColor: actionModalType === 'start_work' ? '#0284C7' : '#059669', flex: 2 }
                ]} 
                onPress={handleUpdateStatus}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                  {actionModalType === 'start_work' ? 'Begin Work' : 'Confirm Resolved'}
                </Text>
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
  },
  mgmtPill: {
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  mgmtPillTxt: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: Spacing.two,
    color: '#000',
    backgroundColor: '#FAFDFB'
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
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
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    paddingVertical: 4,
  },
  catBtn: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FAFDFB',
  },
  catBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  catBtnTxt: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  catBtnTxtActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#064E3B',
  },
  filterPillTxt: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  filterPillTxtActive: {
    color: '#FFF',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  catBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemBold: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 14,
    marginTop: 2,
  },
  itemSub: {
    color: '#4B5563',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  metaTxt: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  ongoingBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  ongoingTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  ongoingNotes: {
    fontSize: 9,
    color: '#1E40AF',
    marginTop: 2,
  },
  resolvedBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  resolvedTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#047857',
  },
  resolvedNotes: {
    fontSize: 9,
    color: '#065F46',
    marginTop: 2,
  },
  resolvedDate: {
    fontSize: 8,
    color: '#6EE7B7',
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  startWorkBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  startWorkBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  resolveBtn: {
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resolveBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 4,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
