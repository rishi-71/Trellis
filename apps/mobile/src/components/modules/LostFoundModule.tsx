import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import { Spacing } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

interface LostFoundProps {
  token: string;
  backendUrl: string;
}

export default function LostFoundModule({ token, backendUrl }: LostFoundProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('lost');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  
  // Media states
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');

  // Tag filter state
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

  const fetchLostFound = useCallback(async () => {
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
  }, [backendUrl, token]);

  const pickImage = async (mediaType: 'proof' | 'photo') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Permission to access photos is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const base64Data = `data:image/jpeg;base64,${asset.base64}`;
      if (mediaType === 'proof') {
        setProofBase64(base64Data);
        setProofFileName(asset.fileName || 'proof_receipt.jpg');
      } else {
        setPhotoBase64(base64Data);
        setPhotoFileName(asset.fileName || 'item_photo.jpg');
      }
    }
  };

  const uploadImage = async (base64Data: string): Promise<string> => {
    const res = await fetch(`${backendUrl}/api/upload-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileType: 'image'
      })
    });
    const data = await res.json();
    if (data.success) {
      return data.url;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  };

  const handleReport = async () => {
    if (!title || !desc || !location || !contact) {
      Alert.alert('Error', 'Please fill in Title, Description, Location, and Contact Details.');
      return;
    }

    if (type === 'lost' && !proofBase64) {
      Alert.alert('Error', 'Ownership proof (receipt/bill) is required for reporting lost items.');
      return;
    }

    setLoading(true);
    try {
      let proofUrl = '';
      let imageUrl = '';

      if (proofBase64) {
        proofUrl = await uploadImage(proofBase64);
      }
      if (photoBase64) {
        imageUrl = await uploadImage(photoBase64);
      }

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
          location,
          contactDetails: contact,
          proofUrl,
          imageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDesc('');
        setLocation('');
        setContact('');
        setProofBase64(null);
        setProofFileName('');
        setPhotoBase64(null);
        setPhotoFileName('');
        Alert.alert('Success', 'Item logged on bulletin board!');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Error publishing report');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Upload / Connection failed: ' + err.message);
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
        Alert.alert('Success', 'Item claimed / status resolved!');
        fetchLostFound();
      }
    } catch (err) {
      Alert.alert('Error', 'Could not claim item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostFound();
  }, [fetchLostFound]);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📦 Lost & Found Claims</Text>

      <Text style={styles.label}>Report Belongings</Text>
      
      {/* Category selector */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'lost' && styles.typeBtnLostActive]}
          onPress={() => {
            setType('lost');
            setProofBase64(null);
            setProofFileName('');
          }}
        >
          <Text style={[styles.typeBtnTxt, type === 'lost' && styles.typeBtnTxtActive]}>LOST</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'found' && styles.typeBtnFoundActive]}
          onPress={() => {
            setType('found');
            setProofBase64(null);
            setProofFileName('');
          }}
        >
          <Text style={[styles.typeBtnTxt, type === 'found' && styles.typeBtnTxtActive]}>FOUND</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Item Title (e.g. Blue Wallet) *"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#9CA3AF"
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Specific details like color, brands, date lost/found... *"
        value={desc}
        onChangeText={setDesc}
        multiline
        placeholderTextColor="#9CA3AF"
      />

      <View style={{ flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.two }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Location *"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Contact Info *"
          value={contact}
          onChangeText={setContact}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Proof picker for LOST ONLY */}
      {type === 'lost' && (
        <View style={styles.uploadBlock}>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('proof')}>
            <Text style={styles.uploadBtnTxt}>
              {proofFileName ? '✓ Change Receipt/Bill' : '📎 Add Receipt/Bill (Required) *'}
            </Text>
          </TouchableOpacity>
          {proofFileName ? <Text style={styles.fileNameTxt}>{proofFileName}</Text> : null}
        </View>
      )}

      {/* Photo Picker */}
      <View style={styles.uploadBlock}>
        <TouchableOpacity style={[styles.uploadBtn, { borderColor: '#A7F3D0' }]} onPress={() => pickImage('photo')}>
          <Text style={[styles.uploadBtnTxt, { color: '#059669' }]}>
            {photoFileName ? '✓ Change Item Photo' : '📷 Add Item Photo (Optional)'}
          </Text>
        </TouchableOpacity>
        {photoFileName ? <Text style={styles.fileNameTxt}>{photoFileName}</Text> : null}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleReport} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Uploading & Publishing...' : 'Submit Report'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      <View style={styles.divider} />
      
      {/* Pills Filter Selection Heading */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.sectionSub}>Bulletins</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]} 
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillTxt, filter === 'all' && styles.filterPillTxtActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'lost' && styles.filterPillActive]} 
            onPress={() => setFilter('lost')}
          >
            <Text style={[styles.filterPillTxt, filter === 'lost' && styles.filterPillTxtActive]}>Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'found' && styles.filterPillActive]} 
            onPress={() => setFilter('found')}
          >
            <Text style={[styles.filterPillTxt, filter === 'found' && styles.filterPillTxtActive]}>Found</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <Text style={styles.emptyText}>No bulletins found.</Text>
      ) : (
        filteredItems.map((item, idx) => (
          <View key={item._id || idx} style={styles.itemRow}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
              ) : (
                <View style={styles.itemImgPlaceholder}>
                  <Text style={{ fontSize: 18 }}>📦</Text>
                </View>
              )}
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  <Text style={[styles.typeBadge, item.type === 'lost' ? styles.typeBadgeLost : styles.typeBadgeFound]}>
                    {item.type.toUpperCase()}
                  </Text>
                  <Text style={styles.itemBold}>{item.title}</Text>
                </View>
                <Text style={styles.itemSub}>{item.description}</Text>
                
                <Text style={styles.metaTxt}>📍 {item.location}</Text>
                <Text style={styles.metaTxt}>📞 {item.contact}</Text>
                
                {item.proofUrl ? (
                  <Text style={styles.proofLabel}>📄 Receipt Verified</Text>
                ) : null}
              </View>

              <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                {item.status !== 'claimed' ? (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(item._id)}>
                    <Text style={styles.claimBtnTxt}>Resolve</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.claimedTxt}>Claimed</Text>
                )}
              </View>
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
    marginBottom: 6,
  },
  uploadBlock: {
    marginBottom: Spacing.two,
  },
  uploadBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
  },
  uploadBtnTxt: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  fileNameTxt: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    paddingLeft: 4,
    fontStyle: 'italic',
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
  filterRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterPillActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  filterPillTxt: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  filterPillTxtActive: {
    color: '#064E3B',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  itemImgPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeLost: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  typeBadgeFound: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  itemBold: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 14,
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
  proofLabel: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 3,
  },
  claimBtn: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  claimBtnTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  claimedTxt: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F9FAFB'
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FFF'
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
