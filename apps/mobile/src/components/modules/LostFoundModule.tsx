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

interface LostFoundProps {
  token: string;
  backendUrl: string;
}

export default function LostFoundModule({ token, backendUrl }: LostFoundProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('lost');



  const fetchLostFound = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/lostfound`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (err: any) {
      console.log('Error fetching lost & found:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!title || !desc) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          description: desc,
          type,
          location: 'Campus Ground',
          contactDetails: 'student@ips.edu'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDesc('');
        Alert.alert('Success', 'Item logged on bulletin board!');
        fetchLostFound();
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound/${itemId}/claim`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Item claimed!');
        fetchLostFound();
      }
    } catch (err) {
      Alert.alert('Error', 'Could not claim item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchLostFound();
    }, 0);
    return () => clearTimeout(t);
  }, [backendUrl, token]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📦 Lost & Found Claims</Text>

      <Text style={styles.label}>Report Belongings</Text>
      <TextInput
        style={styles.input}
        placeholder="Item Title (e.g. Blue Wallet)"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#9CA3AF"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Specific details about where/when you lost/found it..."
        value={desc}
        onChangeText={setDesc}
        multiline
        placeholderTextColor="#9CA3AF"
      />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'lost' && styles.typeBtnLostActive]}
          onPress={() => setType('lost')}
        >
          <Text style={[styles.typeBtnTxt, type === 'lost' && styles.typeBtnTxtActive]}>LOST</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'found' && styles.typeBtnFoundActive]}
          onPress={() => setType('found')}
        >
          <Text style={[styles.typeBtnTxt, type === 'found' && styles.typeBtnTxtActive]}>FOUND</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleReport}>
        <Text style={styles.btnText}>Submit Report</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>Active Bulletins</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No items reported.</Text>
      ) : (
        items.map((item, idx) => (
          <View key={item._id || idx} style={styles.itemRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemBold}>[{item.type.toUpperCase()}] {item.title}</Text>
                <Text style={styles.itemSub}>{item.description}</Text>
              </View>
              {item.status !== 'claimed' ? (
                <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(item._id)}>
                  <Text style={styles.claimBtnTxt}>Claim</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.claimedTxt}>Claimed</Text>
              )}
            </View>
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
  claimBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  claimBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  claimedTxt: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeBtnLostActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  typeBtnFoundActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  typeBtnTxt: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  typeBtnTxtActive: {
    color: '#1F2937',
  },
});
