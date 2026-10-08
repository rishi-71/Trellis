import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

interface ComplaintsProps {
  token: string;
  backendUrl: string;
  userRole?: string | null;
}

type StudentTab = 'active' | 'file_new';
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'resolved';

const CATEGORIES = [
  { id: 'wifi', label: 'Wi-Fi / Internet', icon: '📶' },
  { id: 'electrical', label: 'Electrical / Fan', icon: '⚡' },
  { id: 'projector', label: 'Projector / Screen', icon: '📽️' },
  { id: 'washroom', label: 'Washroom Hygiene', icon: '🚾' },
  { id: 'cleaning', label: 'Housekeeping', icon: '🧹' },
  { id: 'lab_equipment', label: 'Lab Equipment', icon: '🖥️' },
  { id: 'water_cooler', label: 'Drinking Water', icon: '💧' },
  { id: 'other', label: 'General Facility', icon: '📦' }
];

export default function ComplaintsModule({ token, backendUrl, userRole }: ComplaintsProps) {
  const isManagement = userRole === 'management' || userRole === 'admin';
  const isFaculty = userRole === 'faculty';

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);

  // Student Section Tabs: 'active' (view tickets) vs 'file_new' (form)
  const [studentTab, setStudentTab] = useState<StudentTab>('active');

  // Filtering & Search
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // File Complaint Form States
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('wifi');
  const [description, setDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Management Action Modals
  const [assigningComplaint, setAssigningComplaint] = useState<any | null>(null);
  const [technicianName, setTechnicianName] = useState('');
  const [resolvingComplaint, setResolvingComplaint] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch Complaints
  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = isManagement
        ? `${backendUrl}/api/complaints`
        : `${backendUrl}/api/complaints/my`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      }
    } catch (err: any) {
      console.warn('Complaints fetch note:', err.message);
    }
  }, [backendUrl, token, isManagement]);

  useEffect(() => {
    setLoading(true);
    fetchComplaints().finally(() => setLoading(false));
  }, [fetchComplaints]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  // Submit New Complaint (Student)
  const handleFileComplaint = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Required', 'Please fill in Title, Location/Room, and Description.');
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await fetch(`${backendUrl}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          category,
          description: description.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Ticket Raised! 🛠️', 'Your complaint has been logged with campus facilities.');
        setTitle('');
        setLocation('');
        setDescription('');
        setStudentTab('active'); // Auto-switch to Active Complaints tab
        fetchComplaints();
      } else {
        Alert.alert('Error', data.message || 'Could not log complaint.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Delete Complaint (Available to both Student owner & Management)
  const handleDeleteComplaint = (complaintId: string, itemTitle: string) => {
    Alert.alert(
      'Delete Complaint Ticket',
      `Are you sure you want to permanently delete "${itemTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/complaints/${complaintId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Deleted', 'Ticket removed successfully.');
                fetchComplaints();
              } else {
                Alert.alert('Error', data.message || 'Could not delete ticket.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // Management: Assign Technician & Mark In Progress
  const handleAssignTechnician = async () => {
    if (!assigningComplaint) return;
    if (!technicianName.trim()) {
      Alert.alert('Required', 'Please enter the technician name.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/complaints/${assigningComplaint._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'in_progress',
          assignedTo: technicianName.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Work Started 🔧', `Assigned to ${technicianName.trim()}.`);
        setAssigningComplaint(null);
        setTechnicianName('');
        fetchComplaints();
      } else {
        Alert.alert('Error', data.message || 'Could not update status.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Management: Mark Resolved
  const handleResolveComplaint = async () => {
    if (!resolvingComplaint) return;
    if (!resolutionNotes.trim()) {
      Alert.alert('Required', 'Please enter resolution notes explaining the fix.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/complaints/${resolvingComplaint._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'resolved',
          resolutionNotes: resolutionNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Resolved ✅', 'Complaint closed with resolution notes.');
        setResolvingComplaint(null);
        setResolutionNotes('');
        fetchComplaints();
      } else {
        Alert.alert('Error', data.message || 'Could not resolve complaint.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.assignedTo?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [complaints, statusFilter, searchQuery]);

  // Counts
  const pendingCount = useMemo(() => complaints.filter((c) => c.status === 'pending').length, [complaints]);
  const inProgressCount = useMemo(() => complaints.filter((c) => c.status === 'in_progress').length, [complaints]);
  const resolvedCount = useMemo(() => complaints.filter((c) => c.status === 'resolved').length, [complaints]);

  if (isFaculty) {
    return (
      <View style={styles.facultyBlockedCard}>
        <Text style={styles.facultyBlockedEmoji}>🔧</Text>
        <Text style={styles.facultyBlockedTitle}>Access Restricted</Text>
        <Text style={styles.facultyBlockedDesc}>
          The Campus Support & Maintenance board is managed directly between students and facilities management. Faculty members do not participate in service tickets.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- STUDENT TOP TABS: Active Complaints vs File New Complaint --- */}
      {!isManagement && (
        <View style={styles.studentTabsWrap}>
          <TouchableOpacity
            style={[styles.studentTabBtn, studentTab === 'active' && styles.studentTabBtnActive]}
            onPress={() => setStudentTab('active')}
          >
            <Text style={[styles.studentTabTxt, studentTab === 'active' && styles.studentTabTxtActive]}>
              📋 Active Complaints ({complaints.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.studentTabBtn, studentTab === 'file_new' && styles.studentTabBtnActive]}
            onPress={() => setStudentTab('file_new')}
          >
            <Text style={[styles.studentTabTxt, studentTab === 'file_new' && styles.studentTabTxtActive]}>
              ✍️ File New Complaint
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= VIEW 1: FILE NEW COMPLAINT TAB (Student) ================= */}
      {!isManagement && studentTab === 'file_new' ? (
        <ScrollView contentContainerStyle={styles.formScrollContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Raise a Campus Service Ticket</Text>
            <Text style={styles.formCardSub}>
              Fill in the details below. Our campus facilities team will inspect and dispatch a technician.
            </Text>

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Select Issue Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, category === c.id && styles.catChipActive]}
                  onPress={() => setCategory(c.id)}
                >
                  <Text style={[styles.catChipTxt, category === c.id && styles.catChipTxtActive]}>
                    {c.icon} {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Issue Title */}
            <Text style={styles.fieldLabel}>Issue Summary / Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Wi-Fi router flashing red / No connection"
              value={title}
              onChangeText={setTitle}
            />

            {/* Location */}
            <Text style={styles.fieldLabel}>Location & Room Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Block C, 3rd Floor, Room 304"
              value={location}
              onChangeText={setLocation}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Detailed Description</Text>
            <TextInput
              style={[styles.textInput, { height: 95, textAlignVertical: 'top' }]}
              placeholder="Please provide details (e.g. power outlet sparked, AC leaking water)..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitTicketBtn}
              disabled={submittingTicket}
              onPress={handleFileComplaint}
            >
              {submittingTicket ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitTicketBtnTxt}>Submit Maintenance Ticket ➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ================= VIEW 2: ACTIVE COMPLAINTS LIST (Student & Management) ================= */
        <View style={{ flex: 1 }}>
          {/* Status Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollWrap} contentContainerStyle={styles.filterScrollContent}>
            {[
              { id: 'all', label: 'All Tickets', count: complaints.length },
              { id: 'pending', label: '⏳ Pending', count: pendingCount },
              { id: 'in_progress', label: '🔧 Ongoing', count: inProgressCount },
              { id: 'resolved', label: '✅ Resolved', count: resolvedCount }
            ].map((f) => {
              const isActive = statusFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPillBtn, isActive && styles.filterPillBtnActive]}
                  onPress={() => setStatusFilter(f.id as StatusFilter)}
                >
                  <Text style={[styles.filterPillTxt, isActive && styles.filterPillTxtActive]}>
                    {f.label} ({f.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by issue, room, location, or technician..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Complaints Scroll List */}
          <ScrollView
            contentContainerStyle={styles.scrollList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
            }
          >
            {loading && !refreshing && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingTxt}>Fetching facility tickets...</Text>
              </View>
            )}

            {filteredComplaints.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>No Complaints Found</Text>
                <Text style={styles.emptySub}>
                  {isManagement
                    ? 'All campus maintenance tickets are up to date.'
                    : 'No complaints in this filter. Switch to "File New Complaint" if anything needs repair!'}
                </Text>
              </View>
            ) : (
              filteredComplaints.map((item) => {
                const catObj = CATEGORIES.find((c) => c.id === item.category);
                const icon = catObj?.icon || '📦';
                const catLabel = catObj?.label || item.category || 'General';

                const statusBg =
                  item.status === 'resolved'
                    ? '#DCFCE7'
                    : item.status === 'in_progress'
                    ? '#E0E7FF'
                    : '#FEF3C7';
                const statusTxtColor =
                  item.status === 'resolved'
                    ? '#15803D'
                    : item.status === 'in_progress'
                    ? '#4338CA'
                    : '#B45309';
                const statusLabel =
                  item.status === 'resolved'
                    ? 'RESOLVED'
                    : item.status === 'in_progress'
                    ? 'IN PROGRESS'
                    : 'PENDING';

                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <View key={item._id} style={styles.ticketCard}>
                    {/* Header */}
                    <View style={styles.ticketHeader}>
                      <View style={styles.catBadge}>
                        <Text style={styles.catTxt}>
                          {icon} {catLabel}
                        </Text>
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusBadgeTxt, { color: statusTxtColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Title & Location */}
                    <Text style={styles.ticketTitle}>{item.title}</Text>
                    <View style={styles.locationRow}>
                      <Text style={styles.locationTxt}>📍 {item.location}</Text>
                      <Text style={styles.dateTxt}>🕒 {dateStr}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.ticketDesc}>{item.description}</Text>

                    {/* Assignment details (if in progress) */}
                    {item.assignedTo && (
                      <View style={styles.assignedBox}>
                        <Text style={styles.assignedTxt}>
                          👷 Assigned Technician:{' '}
                          <Text style={{ fontWeight: '800' }}>{item.assignedTo}</Text>
                        </Text>
                      </View>
                    )}

                    {/* Resolution Notes (if resolved) */}
                    {item.resolutionNotes && (
                      <View style={styles.resolutionBox}>
                        <Text style={styles.resolutionTitle}>Resolution Notes:</Text>
                        <Text style={styles.resolutionTxt}>{item.resolutionNotes}</Text>
                      </View>
                    )}

                    {/* Action Footer: Delete Option (Student & Management) + Workflow Actions (Management) */}
                    <View style={styles.ticketFooterRow}>
                      {/* Delete / Withdraw Button (Available to both Student & Management) */}
                      <TouchableOpacity
                        style={styles.deleteTicketBtn}
                        onPress={() => handleDeleteComplaint(item._id, item.title)}
                      >
                        <Text style={styles.deleteTicketBtnTxt}>🗑️ Delete Ticket</Text>
                      </TouchableOpacity>

                      {/* Management Workflow Actions */}
                      {isManagement && (
                        <View style={styles.mgmtActionGroup}>
                          {item.status === 'pending' && (
                            <TouchableOpacity
                              style={styles.startWorkBtn}
                              onPress={() => {
                                setAssigningComplaint(item);
                                setTechnicianName(item.assignedTo || '');
                              }}
                            >
                              <Text style={styles.startWorkBtnTxt}>Assign Staff 🔧</Text>
                            </TouchableOpacity>
                          )}

                          {item.status !== 'resolved' && (
                            <TouchableOpacity
                              style={styles.resolveBtn}
                              onPress={() => {
                                setResolvingComplaint(item);
                                setResolutionNotes(item.resolutionNotes || '');
                              }}
                            >
                              <Text style={styles.resolveBtnTxt}>Resolve ✅</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* ================= MODAL 1: ASSIGN TECHNICIAN (Management) ================= */}
      <Modal
        visible={Boolean(assigningComplaint)}
        animationType="slide"
        transparent
        onRequestClose={() => setAssigningComplaint(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Assign Maintenance Staff</Text>
            <Text style={styles.modalSub}>
              Ticket: {assigningComplaint?.title} ({assigningComplaint?.location})
            </Text>

            <Text style={styles.fieldLabel}>Technician / Staff Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Rajesh Kumar (Electrical Team)"
              value={technicianName}
              onChangeText={setTechnicianName}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssigningComplaint(null)}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#4338CA' }]}
                onPress={handleAssignTechnician}
              >
                <Text style={styles.modalSubmitTxt}>Dispatch Staff</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 2: MARK RESOLVED (Management) ================= */}
      <Modal
        visible={Boolean(resolvingComplaint)}
        animationType="slide"
        transparent
        onRequestClose={() => setResolvingComplaint(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resolve Maintenance Ticket</Text>
            <Text style={styles.modalSub}>
              Ticket: {resolvingComplaint?.title} ({resolvingComplaint?.location})
            </Text>

            <Text style={styles.fieldLabel}>Resolution Notes</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Explain how the issue was fixed (e.g. replaced power cable and reset DNS)..."
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setResolvingComplaint(null)}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleResolveComplaint}
              >
                <Text style={styles.modalSubmitTxt}>Complete Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  facultyBlockedCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  facultyBlockedEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  facultyBlockedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 6,
  },
  facultyBlockedDesc: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
  bannerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  studentTabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 8,
  },
  studentTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  studentTabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  studentTabTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  studentTabTxtActive: {
    color: '#064E3B',
    fontWeight: '800',
  },
  formScrollContainer: {
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    gap: 6,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B',
  },
  formCardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 15,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginTop: 4,
    marginBottom: 2,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  catChip: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  catChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  catChipTxtActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#111827',
  },
  submitTicketBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  submitTicketBtnTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  filterScrollWrap: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  filterScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  filterPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  filterPillTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    lineHeight: 16,
    includeFontPadding: false,
  },
  filterPillTxtActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 4,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
  },
  scrollList: {
    paddingBottom: 24,
    gap: 8,
    marginTop: 4,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingTxt: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginVertical: 12,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  emptySub: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 15,
  },
  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  locationTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  dateTxt: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  ticketDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 2,
  },
  assignedBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
  },
  assignedTxt: {
    fontSize: 11,
    color: '#065F46',
  },
  resolutionBox: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
  },
  resolutionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  resolutionTxt: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 1,
  },
  ticketFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexWrap: 'wrap',
    gap: 6,
  },
  deleteTicketBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteTicketBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  mgmtActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  startWorkBtn: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  startWorkBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  resolveBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resolveBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
});
