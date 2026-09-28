import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import { Spacing } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

interface LostFoundProps {
  token: string;
  backendUrl: string;
  userRole?: string | null;
}

export default function LostFoundModule({ token, backendUrl, userRole }: LostFoundProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  
  // Media states
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');

  // Tag filter state
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'awaiting' | 'ready' | 'claimed'>('all');

  // Management Action Modal states
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Central Management Office (Room 102)');
  const [mgmtNotes, setMgmtNotes] = useState('');

  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [claimedBy, setClaimedBy] = useState('');

  const isManagement = userRole === 'management' || userRole === 'admin';

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

  // Dynamic real-time polling every 5 seconds
  useEffect(() => {
    fetchLostFound();
    const interval = setInterval(fetchLostFound, 5000);
    return () => clearInterval(interval);
  }, [fetchLostFound]);

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
        Alert.alert(
          'Success', 
          type === 'found' 
            ? 'Item reported! Please submit the physical item to Management Office (Room 102) for safe keeping.'
            : 'Lost item report published on campus bulletin!'
        );
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

  // Management sets item as ready for pickup
  const handleSetReadyForPickup = async () => {
    if (!selectedItem) return;
    if (!pickupDate || !pickupLocation) {
      Alert.alert('Error', 'Please provide a Pickup Date/Window and Pickup Location.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound/${selectedItem._id}/management-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'ready_for_pickup',
          pickupDate,
          pickupLocation,
          managementNotes: mgmtNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Item marked as Received & Ready for Pickup!');
        setPickupModalVisible(false);
        setSelectedItem(null);
        setPickupDate('');
        setMgmtNotes('');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Failed to update item status');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Management marks item as claimed/handed over
  const handleMarkClaimed = async () => {
    if (!selectedItem) return;
    if (!claimedBy) {
      Alert.alert('Error', 'Please enter who received/claimed the item.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound/${selectedItem._id}/management-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'claimed',
          claimedBy
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Item marked as Claimed & Handed Over!');
        setClaimModalVisible(false);
        setSelectedItem(null);
        setClaimedBy('');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Failed to update claim');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleClaim = async (itemId: string) => {
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

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'lost') return item.type === 'lost';
    if (filter === 'found') return item.type === 'found';
    if (filter === 'awaiting') return item.status === 'awaiting_handover';
    if (filter === 'ready') return item.status === 'ready_for_pickup';
    if (filter === 'claimed') return item.status === 'claimed';
    return true;
  });

  const getStatusBadge = (item: any) => {
    const st = item.status || 'open';
    if (st === 'awaiting_handover') {
      return { label: '⏳ Handover Pending', bg: '#FEF3C7', color: '#92400E' };
    }
    if (st === 'ready_for_pickup') {
      return { label: '🟢 Ready for Pickup', bg: '#D1FAE5', color: '#065F46' };
    }
    if (st === 'claimed') {
      return { label: '✅ Handed Over / Claimed', bg: '#F3F4F6', color: '#6B7280' };
    }
    return { label: '🟡 Open Report', bg: '#FEF9C3', color: '#854D0E' };
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two }}>
        <Text style={styles.cardTitle}>📦 Lost & Found Claims</Text>
        {isManagement && (
          <View style={styles.mgmtPill}>
            <Text style={styles.mgmtPillTxt}>Management Desk</Text>
          </View>
        )}
      </View>

      {/* Form for reporting */}
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
          <Text style={[styles.typeBtnTxt, type === 'lost' && styles.typeBtnTxtActive]}>LOST ITEM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'found' && styles.typeBtnFoundActive]}
          onPress={() => {
            setType('found');
            setProofBase64(null);
            setProofFileName('');
          }}
        >
          <Text style={[styles.typeBtnTxt, type === 'found' && styles.typeBtnTxtActive]}>FOUND ITEM</Text>
        </TouchableOpacity>
      </View>

      {type === 'found' && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTxt}>
            💡 Notice: After submitting this report, please physically deliver the found item to the Management Office (Room 102).
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Item Title (e.g. Blue Titan Watch) *"
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
        <TouchableOpacity style={[styles.uploadBtn, { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }]} onPress={() => pickImage('photo')}>
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
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.sectionSub}>Live Bulletins ({filteredItems.length})</Text>
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
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'awaiting' && styles.filterPillActive]} 
            onPress={() => setFilter('awaiting')}
          >
            <Text style={[styles.filterPillTxt, filter === 'awaiting' && styles.filterPillTxtActive]}>Awaiting Handover</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'ready' && styles.filterPillActive]} 
            onPress={() => setFilter('ready')}
          >
            <Text style={[styles.filterPillTxt, filter === 'ready' && styles.filterPillTxtActive]}>Ready Pickup</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, filter === 'claimed' && styles.filterPillActive]} 
            onPress={() => setFilter('claimed')}
          >
            <Text style={[styles.filterPillTxt, filter === 'claimed' && styles.filterPillTxtActive]}>Claimed</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {filteredItems.length === 0 ? (
        <Text style={styles.emptyText}>No bulletins matching the filter.</Text>
      ) : (
        filteredItems.map((item, idx) => {
          const badge = getStatusBadge(item);
          return (
            <View key={item._id || idx} style={styles.itemRow}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
                ) : (
                  <View style={styles.itemImgPlaceholder}>
                    <Text style={{ fontSize: 20 }}>{item.type === 'lost' ? '🔍' : '📦'}</Text>
                  </View>
                )}
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                    <Text style={[styles.typeBadge, item.type === 'lost' ? styles.typeBadgeLost : styles.typeBadgeFound]}>
                      {item.type.toUpperCase()}
                    </Text>
                    <Text style={[styles.statusBadge, { backgroundColor: badge.bg, color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={styles.itemBold}>{item.title}</Text>
                  <Text style={styles.itemSub}>{item.description}</Text>
                  
                  <Text style={styles.metaTxt}>📍 {item.location}</Text>
                  <Text style={styles.metaTxt}>📞 {item.contactDetails || item.contact || 'N/A'}</Text>
                  
                  {item.proofUrl ? (
                    <Text style={styles.proofLabel}>📄 Ownership Proof Verified</Text>
                  ) : null}

                  {/* Pickup scheduling info if set */}
                  {item.status === 'ready_for_pickup' && (
                    <View style={styles.pickupDetailBox}>
                      <Text style={styles.pickupDetailTitle}>🏢 Pickup Location: {item.pickupLocation || 'Management Desk'}</Text>
                      {item.pickupDate ? (
                        <Text style={styles.pickupDetailSub}>📅 Collection Date: {item.pickupDate}</Text>
                      ) : null}
                      {item.managementNotes ? (
                        <Text style={styles.pickupDetailNotes}>📝 {item.managementNotes}</Text>
                      ) : null}
                    </View>
                  )}

                  {/* Claimed / Handed Over details */}
                  {item.status === 'claimed' && item.claimedBy && (
                    <View style={styles.claimedDetailBox}>
                      <Text style={styles.claimedDetailTxt}>👤 Handed over to: {item.claimedBy}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                {isManagement && item.status === 'awaiting_handover' && (
                  <TouchableOpacity 
                    style={styles.mgmtActionBtn} 
                    onPress={() => {
                      setSelectedItem(item);
                      setPickupDate(new Date(Date.now() + 86400000).toISOString().split('T')[0] + ' 10:00 AM - 4:00 PM');
                      setPickupLocation('Central Management Office (Room 102)');
                      setMgmtNotes('Please present Student ID card for verification upon collection.');
                      setPickupModalVisible(true);
                    }}
                  >
                    <Text style={styles.mgmtActionBtnTxt}>📥 Receive & Schedule Pickup</Text>
                  </TouchableOpacity>
                )}

                {isManagement && (item.status === 'ready_for_pickup' || item.status === 'open') && (
                  <TouchableOpacity 
                    style={[styles.mgmtActionBtn, { backgroundColor: '#059669' }]} 
                    onPress={() => {
                      setSelectedItem(item);
                      setClaimedBy('');
                      setClaimModalVisible(true);
                    }}
                  >
                    <Text style={styles.mgmtActionBtnTxt}>🤝 Mark Claimed / Handed Over</Text>
                  </TouchableOpacity>
                )}

                {!isManagement && item.status !== 'claimed' && (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleSimpleClaim(item._id)}>
                    <Text style={styles.claimBtnTxt}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* MODAL 1: Management Receive & Set Pickup Schedule */}
      <Modal visible={pickupModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📥 Receive & Schedule Pickup</Text>
            <Text style={styles.modalSubtitle}>Item: {selectedItem?.title}</Text>

            <Text style={styles.modalLabel}>Pickup Window / Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tomorrow 10:00 AM - 4:00 PM"
              value={pickupDate}
              onChangeText={setPickupDate}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.modalLabel}>Pickup Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Management Office Room 102"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.modalLabel}>Instructions / Verification Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Bring college ID card and purchase receipt"
              value={mgmtNotes}
              onChangeText={setMgmtNotes}
              multiline
              placeholderTextColor="#9CA3AF"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} 
                onPress={() => setPickupModalVisible(false)}
              >
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#10B981', flex: 2 }]} 
                onPress={handleSetReadyForPickup}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Set Ready for Pickup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Management Mark Handed Over */}
      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🤝 Mark as Claimed / Handed Over</Text>
            <Text style={styles.modalSubtitle}>Item: {selectedItem?.title}</Text>

            <Text style={styles.modalLabel}>Claimant Information (Name / ID) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rishi Kumar (Enrollment #0801CS211045)"
              value={claimedBy}
              onChangeText={setClaimedBy}
              placeholderTextColor="#9CA3AF"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} 
                onPress={() => setClaimModalVisible(false)}
              >
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#059669', flex: 2 }]} 
                onPress={handleMarkClaimed}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Confirm Handover</Text>
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
    marginBottom: 6,
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  noticeTxt: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
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
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  itemImgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    fontSize: 9,
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
  proofLabel: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
  },
  pickupDetailBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  pickupDetailTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
  },
  pickupDetailSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  pickupDetailNotes: {
    fontSize: 9,
    color: '#065F46',
    fontStyle: 'italic',
    marginTop: 2,
  },
  claimedDetailBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  claimedDetailTxt: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  mgmtActionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mgmtActionBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
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
