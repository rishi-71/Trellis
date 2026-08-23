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

interface ComplaintsProps {
  token: string;
  backendUrl: string;
}

export default function ComplaintsModule({ token, backendUrl }: ComplaintsProps) {
  const [loading, setLoading] = useState(false);
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [complaintCat, setComplaintCat] = useState('wifi');
  const [complaintDesc, setComplaintDesc] = useState('');

  const categories = ['wifi', 'washroom', 'projector', 'cleaning', 'other'];



  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMyComplaints(data.complaints || []);
    } catch (err: any) {
      console.log('Error fetching complaints:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = async () => {
    if (!complaintDesc) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/complaints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ category: complaintCat, description: complaintDesc })
      });
      const data = await res.json();
      if (data.success) {
        setComplaintDesc('');
        Alert.alert('Success', 'Complaint ticket submitted successfully!');
        fetchComplaints();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to file support request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchComplaints();
    }, 0);
    return () => clearTimeout(t);
  }, [backendUrl, token]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🔧 Support Complaints</Text>
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catBtn, complaintCat === cat && styles.catBtnActive]}
            onPress={() => setComplaintCat(cat)}
          >
            <Text style={[styles.catBtnTxt, complaintCat === cat && styles.catBtnTxtActive]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Details / Room Number</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter complaint details..."
        value={complaintDesc}
        onChangeText={setComplaintDesc}
        multiline
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleFileComplaint}>
        <Text style={styles.btnText}>Submit Ticket</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>My Active Case Tickets</Text>
      {myComplaints.length === 0 ? (
        <Text style={styles.emptyText}>No tickets reported.</Text>
      ) : (
        myComplaints.map((c, idx) => (
          <View key={c._id || idx} style={styles.itemRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.itemBold}>[{c.category.toUpperCase()}] {c.status}</Text>
            </View>
            <Text style={styles.itemSub}>{c.description}</Text>
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
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  catBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  catBtnTxt: {
    fontSize: 9,
    color: '#059669',
  },
  catBtnTxtActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
