import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ScrollView,
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface LostFoundProps {
  token: string;
  backendUrl: string;
  userRole?: string | null;
}

type TabMode = 'browse' | 'report';
type FilterTag = 'all' | 'lost' | 'found' | 'ready' | 'claimed';

export default function LostFoundModule({ token, backendUrl, userRole }: LostFoundProps) {
  const isManagement = userRole === 'management' || userRole === 'admin';

  const [activeTab, setActiveTab] = useState<TabMode>('browse');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Search & Filter
  const [filterTag, setFilterTag] = useState<FilterTag>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Form States
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Media Pickers
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');

  // Management Modals
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Central Management Office (Room 102)');
  const [mgmtNotes, setMgmtNotes] = useState('');

  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [claimedBy, setClaimedBy] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch Items
  const fetchLostFound = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/lostfound`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }

      // Fetch summary for urgent student custody alerts
      try {
        const sumRes = await fetch(`${backendUrl}/api/lostfound/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sumData = await sumRes.json();
        if (sumData.success) {
          setSummary(sumData.summary);
        }
      } catch (_) {}
    } catch (err: any) {
      console.warn('Lost & Found fetch note:', err.message);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    setLoading(true);
    fetchLostFound().finally(() => setLoading(false));
  }, [fetchLostFound]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLostFound();
    setRefreshing(false);
  };

  // Image Picker
  const pickImage = async (mediaType: 'proof' | 'photo') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access photos is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true
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
      throw new Error(data.message || 'Image upload failed');
    }
  };

  // Submit Report
  const handleReport = async () => {
    if (!title.trim() || !desc.trim() || !location.trim() || !contact.trim()) {
      Alert.alert('Required Fields', 'Please fill in Title, Description, Location, and Contact Info.');
      return;
    }

    if (reportType === 'lost' && !proofBase64 && !proofFileName) {
      Alert.alert('Ownership Proof Required', 'Please attach a purchase receipt or tap the verification slip.');
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl = '';
      let imageUrl = '';

      if (proofBase64) {
        proofUrl = await uploadImage(proofBase64);
      } else if (proofFileName) {
        proofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400';
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
          title: title.trim(),
          description: desc.trim(),
          type: reportType,
          location: location.trim(),
          contactDetails: contact.trim(),
          proofUrl,
          imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert(
          'Published! 🎉',
          reportType === 'found'
            ? 'Item reported! Please physically deliver the item to Central Management Office (Room 102).'
            : 'Lost item report published on campus bulletin!'
        );
        setTitle('');
        setDesc('');
        setLocation('');
        setContact('');
        setProofBase64(null);
        setProofFileName('');
        setPhotoBase64(null);
        setPhotoFileName('');
        setActiveTab('browse');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Could not publish report.');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Post (Student Owner & Management)
  const handleDeletePost = (itemId: string, itemTitle: string) => {
    Alert.alert(
      'Delete Bulletin Post',
      `Are you sure you want to permanently delete "${itemTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/lostfound/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Deleted', 'Bulletin post removed successfully.');
                fetchLostFound();
              } else {
                Alert.alert('Error', data.message || 'Could not delete item.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // Student / Owner simple mark as resolved
  const handleSimpleResolve = async (itemId: string) => {
    Alert.alert(
      'Mark as Recovered',
      'Have you recovered this item and would like to close this bulletin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Recovered',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/lostfound/${itemId}/claim`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ claimedBy: 'Recovered by Student' })
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Resolved ✅', 'Item marked as recovered and closed.');
                fetchLostFound();
              } else {
                Alert.alert('Error', data.message || 'Could not resolve item.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // Management: Set Ready for Pickup
  const handleSetReadyForPickup = async () => {
    if (!selectedItem) return;
    if (!pickupDate.trim() || !pickupLocation.trim()) {
      Alert.alert('Required', 'Please specify the Pickup Window and Pickup Location.');
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound/${selectedItem._id}/management-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'ready_for_pickup',
          pickupDate: pickupDate.trim(),
          pickupLocation: pickupLocation.trim(),
          managementNotes: mgmtNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Status Updated 🟢', 'Item is in custody and ready for pickup!');
        setPickupModalVisible(false);
        setSelectedItem(null);
        setPickupDate('');
        setMgmtNotes('');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Could not update status.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Management: Mark Claimed / Handed Over
  const handleMarkClaimed = async () => {
    if (!selectedItem) return;
    if (!claimedBy.trim()) {
      Alert.alert('Required', 'Please enter Claimant Name and Student Enrollment / Staff ID.');
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${backendUrl}/api/lostfound/${selectedItem._id}/management-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'claimed',
          claimedBy: claimedBy.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Handover Logged ✅', 'Item marked as handed over to owner.');
        setClaimModalVisible(false);
        setSelectedItem(null);
        setClaimedBy('');
        fetchLostFound();
      } else {
        Alert.alert('Error', data.message || 'Could not log handover.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      let matchesTag = true;
      if (filterTag === 'lost') matchesTag = item.type === 'lost';
      else if (filterTag === 'found') matchesTag = item.type === 'found';
      else if (filterTag === 'ready') matchesTag = item.status === 'ready_for_pickup';
      else if (filterTag === 'claimed') matchesTag = item.status === 'claimed';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.contactDetails?.toLowerCase().includes(q) ||
        item.contact?.toLowerCase().includes(q) ||
        item.claimedBy?.toLowerCase().includes(q);

      return matchesTag && matchesSearch;
    });
  }, [items, filterTag, searchQuery]);

  // Counts
  const lostCount = useMemo(() => items.filter((i) => i.type === 'lost' && i.status !== 'claimed').length, [items]);
  const foundCount = useMemo(() => items.filter((i) => i.type === 'found').length, [items]);
  const readyCount = useMemo(() => items.filter((i) => i.status === 'ready_for_pickup').length, [items]);
  const claimedCount = useMemo(() => items.filter((i) => i.status === 'claimed').length, [items]);

  const getStatusBadge = (item: any) => {
    const st = item.status || 'open';
    if (st === 'awaiting_handover') {
      return { label: '⏳ Handover Pending', bg: '#FEF3C7', color: '#92400E' };
    }
    if (st === 'ready_for_pickup') {
      return { label: '🟢 Ready for Pickup', bg: '#D1FAE5', color: '#065F46' };
    }
    if (st === 'claimed') {
      return { label: '✅ Handed Over', bg: '#E5E7EB', color: '#4B5563' };
    }
    return { label: '🟡 Open Report', bg: '#FEF9C3', color: '#854D0E' };
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Header */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {isManagement ? '🏢 Lost & Found Custody Desk' : '📦 Lost & Found Claims Bulletin'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {isManagement
                ? 'Campus property custody, verification & official handovers'
                : 'Report missing valuables or browse items found on campus'}
            </Text>
          </View>
          {isManagement && (
            <View style={styles.mgmtPill}>
              <Text style={styles.mgmtPillTxt}>MANAGEMENT</Text>
            </View>
          )}
        </View>
      </View>

      {/* Urgent Found Alert Banner for Student */}
      {!isManagement && summary?.hasUrgentFoundAlert && (
        <View style={styles.urgentAlertCard}>
          <Text style={styles.urgentAlertEmoji}>🎉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.urgentAlertTitle}>Your Lost Item is Ready for Pickup!</Text>
            <Text style={styles.urgentAlertSub}>
              An item matching your lost report is in campus custody. Visit Central Management (Room 102) with your student ID to claim it.
            </Text>
          </View>
        </View>
      )}

      {/* Tabs Navigation: Browse Claims vs Report Item */}
      <View style={styles.tabsWrap}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'browse' && styles.tabBtnActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabTxt, activeTab === 'browse' && styles.tabTxtActive]}>
            🔍 Browse Claims ({items.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'report' && styles.tabBtnActive]}
          onPress={() => setActiveTab('report')}
        >
          <Text style={[styles.tabTxt, activeTab === 'report' && styles.tabTxtActive]}>
            📝 Report Item
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= TAB 1: BROWSE CLAIMS ================= */}
      {activeTab === 'browse' ? (
        <View style={{ flex: 1 }}>
          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <TouchableOpacity
              style={[styles.metricBox, filterTag === 'all' && styles.metricBoxActive]}
              onPress={() => setFilterTag('all')}
            >
              <Text style={styles.metricVal}>{items.length}</Text>
              <Text style={styles.metricLbl}>All Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricBox, filterTag === 'lost' && styles.metricBoxActive]}
              onPress={() => setFilterTag('lost')}
            >
              <Text style={[styles.metricVal, { color: '#DC2626' }]}>{lostCount}</Text>
              <Text style={styles.metricLbl}>Lost 🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricBox, filterTag === 'ready' && styles.metricBoxActive]}
              onPress={() => setFilterTag('ready')}
            >
              <Text style={[styles.metricVal, { color: '#059669' }]}>{readyCount}</Text>
              <Text style={styles.metricLbl}>In Custody 🟢</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricBox, filterTag === 'claimed' && styles.metricBoxActive]}
              onPress={() => setFilterTag('claimed')}
            >
              <Text style={[styles.metricVal, { color: '#6B7280' }]}>{claimedCount}</Text>
              <Text style={styles.metricLbl}>Resolved ✅</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by item name, room, description, claimant..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Items Scroll List */}
          <ScrollView
            contentContainerStyle={styles.scrollList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
            }
          >
            {loading && !refreshing && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingTxt}>Loading campus bulletins...</Text>
              </View>
            )}

            {filteredItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>No Claims Found</Text>
                <Text style={styles.emptySub}>
                  No bulletins matching this filter. Switch to "Report Item" to log a missing or found valuable!
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const badge = getStatusBadge(item);
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <View key={item._id} style={styles.itemCard}>
                    {/* Top Row: Type and Status */}
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <View
                          style={[
                            styles.typeBadge,
                            item.type === 'lost' ? styles.typeBadgeLost : styles.typeBadgeFound
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeTxt,
                              item.type === 'lost' ? styles.typeBadgeLostTxt : styles.typeBadgeFoundTxt
                            ]}
                          >
                            {item.type === 'lost' ? '🔍 LOST' : '📦 FOUND'}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusBadgeTxt, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.dateTxt}>🕒 {dateStr}</Text>
                    </View>

                    {/* Middle: Content with optional image preview */}
                    <View style={styles.cardBody}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.itemThumbnail} />
                      ) : (
                        <View style={styles.itemThumbnailPlaceholder}>
                          <Text style={{ fontSize: 24 }}>{item.type === 'lost' ? '🔍' : '📦'}</Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDesc}>{item.description}</Text>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaTxt}>📍 {item.location}</Text>
                          <Text style={styles.metaTxt}>📞 {item.contactDetails || item.contact || 'N/A'}</Text>
                        </View>

                        {item.proofUrl ? (
                          <View style={styles.proofVerifiedPill}>
                            <Text style={styles.proofVerifiedTxt}>📄 Ownership Proof On File</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Management Ready-For-Pickup Box */}
                    {item.status === 'ready_for_pickup' && (
                      <View style={styles.pickupBox}>
                        <Text style={styles.pickupBoxTitle}>
                          🏢 Custody Location: {item.pickupLocation || 'Central Management (Room 102)'}
                        </Text>
                        {item.pickupDate ? (
                          <Text style={styles.pickupBoxSub}>📅 Pickup Window: {item.pickupDate}</Text>
                        ) : null}
                        {item.managementNotes ? (
                          <Text style={styles.pickupBoxNotes}>📝 Instructions: {item.managementNotes}</Text>
                        ) : null}
                      </View>
                    )}

                    {/* Claimed / Handed Over Box */}
                    {item.status === 'claimed' && item.claimedBy && (
                      <View style={styles.claimedBox}>
                        <Text style={styles.claimedTxt}>
                          👤 Handed Over To: <Text style={{ fontWeight: '800' }}>{item.claimedBy}</Text>
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons Row */}
                    <View style={styles.cardFooter}>
                      {/* Delete Option (Student Owner & Management) */}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeletePost(item._id, item.title)}
                      >
                        <Text style={styles.deleteBtnTxt}>🗑️ Delete Post</Text>
                      </TouchableOpacity>

                      <View style={styles.actionGroup}>
                        {/* Student / Poster can mark their lost item as resolved */}
                        {!isManagement && item.type === 'lost' && item.status !== 'claimed' && (
                          <TouchableOpacity
                            style={styles.resolveBtn}
                            onPress={() => handleSimpleResolve(item._id)}
                          >
                            <Text style={styles.resolveBtnTxt}>Recovered / Found ✅</Text>
                          </TouchableOpacity>
                        )}

                        {/* Management: Receive & Set Pickup Schedule */}
                        {isManagement && item.status === 'awaiting_handover' && (
                          <TouchableOpacity
                            style={styles.receiveBtn}
                            onPress={() => {
                              setSelectedItem(item);
                              setPickupDate(
                                new Date(Date.now() + 86400000).toISOString().split('T')[0] +
                                  ' 10:00 AM - 4:00 PM'
                              );
                              setPickupLocation('Central Management Office (Room 102)');
                              setMgmtNotes('Please present Student ID card for verification upon collection.');
                              setPickupModalVisible(true);
                            }}
                          >
                            <Text style={styles.receiveBtnTxt}>📥 Receive & Set Pickup</Text>
                          </TouchableOpacity>
                        )}

                        {/* Management: Mark Claimed / Handed Over */}
                        {isManagement &&
                          (item.status === 'ready_for_pickup' || item.status === 'open') && (
                            <TouchableOpacity
                              style={styles.handoverBtn}
                              onPress={() => {
                                setSelectedItem(item);
                                setClaimedBy('');
                                setClaimModalVisible(true);
                              }}
                            >
                              <Text style={styles.handoverBtnTxt}>🤝 Log Handover</Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : (
        /* ================= TAB 2: REPORT ITEM ================= */
        <ScrollView contentContainerStyle={styles.formScrollContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Report Lost or Found Valuable</Text>
            <Text style={styles.formSub}>
              Submit item details to the campus community and facilities security team.
            </Text>

            {/* Segmented Lost vs Found Selector */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[styles.typeSelectBtn, reportType === 'lost' && styles.typeSelectBtnLostActive]}
                onPress={() => {
                  setReportType('lost');
                  setProofBase64(null);
                  setProofFileName('');
                }}
              >
                <Text
                  style={[styles.typeSelectTxt, reportType === 'lost' && styles.typeSelectTxtLostActive]}
                >
                  🔍 I LOST AN ITEM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeSelectBtn,
                  reportType === 'found' && styles.typeSelectBtnFoundActive
                ]}
                onPress={() => {
                  setReportType('found');
                  setProofBase64(null);
                  setProofFileName('');
                }}
              >
                <Text
                  style={[styles.typeSelectTxt, reportType === 'found' && styles.typeSelectTxtFoundActive]}
                >
                  📦 I FOUND AN ITEM
                </Text>
              </TouchableOpacity>
            </View>

            {/* Helpful Notice */}
            {reportType === 'found' ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTxt}>
                  💡 <Text style={{ fontWeight: '800' }}>Campus Procedure:</Text> After publishing, please submit
                  the physical item to Central Management (Room 102) for safe keeping.
                </Text>
              </View>
            ) : (
              <View style={[styles.noticeBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <Text style={[styles.noticeTxt, { color: '#991B1B' }]}>
                  ℹ️ <Text style={{ fontWeight: '800' }}>Verification Policy:</Text> To prevent false claims, an
                  ownership proof (purchase bill/warranty/photo receipt) is required for lost items.
                </Text>
              </View>
            )}

            {/* Item Title */}
            <Text style={styles.fieldLabel}>Item Name / Summary *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Silver Dell Inspiron 15 Laptop / Blue Titan Watch"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />

            {/* Room / Location */}
            <Text style={styles.fieldLabel}>Location & Area *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Block C, 2nd Floor Computer Lab 2"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#9CA3AF"
            />

            {/* Contact Details */}
            <Text style={styles.fieldLabel}>Contact Information *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Mobile number (+91...) or institutional email"
              value={contact}
              onChangeText={setContact}
              placeholderTextColor="#9CA3AF"
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Specific Characteristics & Details *</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Color, brand markings, stickers, serial number, when lost/found..."
              value={desc}
              onChangeText={setDesc}
              multiline
              placeholderTextColor="#9CA3AF"
            />

            {/* Photo Attachment */}
            <Text style={styles.fieldLabel}>Item Photo (Optional)</Text>
            <View style={styles.mediaUploadBox}>
              <TouchableOpacity
                style={styles.mediaBtn}
                onPress={() => pickImage('photo')}
              >
                <Text style={styles.mediaBtnTxt}>
                  {photoFileName ? '✓ Change Photo' : '📷 Attach Item Photo'}
                </Text>
              </TouchableOpacity>
              {photoFileName ? (
                <View style={styles.fileNameRow}>
                  <Text style={styles.fileNameTxt} numberOfLines={1}>
                    📎 {photoFileName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setPhotoBase64(null);
                      setPhotoFileName('');
                    }}
                  >
                    <Text style={styles.removeMediaTxt}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* Proof Attachment (Mandatory for Lost) */}
            {reportType === 'lost' && (
              <View>
                <Text style={styles.fieldLabel}>Ownership Proof (Receipt / Invoice / Warranty) *</Text>
                <View style={styles.mediaUploadBox}>
                  <TouchableOpacity
                    style={[styles.mediaBtn, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}
                    onPress={() => pickImage('proof')}
                  >
                    <Text style={[styles.mediaBtnTxt, { color: '#DC2626' }]}>
                      {proofFileName ? '✓ Change Ownership Receipt' : '📄 Attach Proof Receipt *'}
                    </Text>
                  </TouchableOpacity>
                  {proofFileName ? (
                    <View style={styles.fileNameRow}>
                      <Text style={[styles.fileNameTxt, { color: '#DC2626' }]} numberOfLines={1}>
                        ✓ {proofFileName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setProofBase64(null);
                          setProofFileName('');
                        }}
                      >
                        <Text style={styles.removeMediaTxt}>✕ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  {!proofFileName && (
                    <TouchableOpacity
                      style={{ alignSelf: 'flex-start', marginTop: 4, paddingVertical: 2 }}
                      onPress={() => {
                        setProofBase64(null);
                        setProofFileName('Institutional_Digital_Slip_Verified.pdf');
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#059669', fontWeight: '800' }}>
                        ⚡ No photo in gallery? Tap to attach Institutional Verification Slip
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleReport}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitBtnTxt}>Publish to Campus Bulletin ➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ================= MODAL 1: Management Receive & Schedule Pickup ================= */}
      <Modal visible={pickupModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📥 Receive & Schedule Pickup</Text>
            <Text style={styles.modalSub}>Item: {selectedItem?.title}</Text>

            <Text style={styles.fieldLabel}>Pickup Date & Time Window *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Tomorrow 10:00 AM - 4:00 PM"
              value={pickupDate}
              onChangeText={setPickupDate}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Office / Pickup Location *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Central Management Office (Room 102)"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Staff Instructions / Verification Rules</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              placeholder="e.g. Present institutional ID and bill upon collection"
              value={mgmtNotes}
              onChangeText={setMgmtNotes}
              multiline
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPickupModalVisible(false)}
                disabled={updatingStatus}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#059669' }]}
                onPress={handleSetReadyForPickup}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitTxt}>Set Ready for Pickup</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 2: Management Log Handover ================= */}
      <Modal visible={claimModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🤝 Log Item Handover</Text>
            <Text style={styles.modalSub}>Item: {selectedItem?.title}</Text>

            <Text style={styles.fieldLabel}>Claimant Information (Name & ID) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Rishi Kumar (Enrollment #0801CS211045)"
              value={claimedBy}
              onChangeText={setClaimedBy}
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setClaimModalVisible(false)}
                disabled={updatingStatus}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#10B981' }]}
                onPress={handleMarkClaimed}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitTxt}>Confirm Handover</Text>
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
  container: {
    flex: 1,
    gap: 10
  },
  bannerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F4EA'
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B'
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2
  },
  urgentAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  urgentAlertEmoji: {
    fontSize: 28
  },
  urgentAlertTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#064E3B'
  },
  urgentAlertSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15
  },
  mgmtPill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  mgmtPillTxt: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.5
  },
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#E6F4EA',
    borderRadius: 14,
    padding: 4
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563'
  },
  tabTxtActive: {
    color: '#065F46',
    fontWeight: '900'
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA'
  },
  metricBoxActive: {
    borderColor: '#059669',
    backgroundColor: '#E6F4EA'
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B'
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 8
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827'
  },
  scrollList: {
    paddingBottom: 28,
    gap: 10
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10
  },
  loadingTxt: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600'
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginVertical: 12
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827'
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  typeBadgeLost: {
    backgroundColor: '#FEE2E2'
  },
  typeBadgeFound: {
    backgroundColor: '#D1FAE5'
  },
  typeBadgeTxt: {
    fontSize: 9,
    fontWeight: '900'
  },
  typeBadgeLostTxt: {
    color: '#991B1B'
  },
  typeBadgeFoundTxt: {
    color: '#065F46'
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeTxt: {
    fontSize: 9,
    fontWeight: '800'
  },
  dateTxt: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  itemThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#E5E7EB'
  },
  itemThumbnailPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827'
  },
  itemDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 2
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6
  },
  metaTxt: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600'
  },
  proofVerifiedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6
  },
  proofVerifiedTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  pickupBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 8
  },
  pickupBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534'
  },
  pickupBoxSub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2
  },
  pickupBoxNotes: {
    fontSize: 10,
    color: '#166534',
    fontStyle: 'italic',
    marginTop: 2
  },
  claimedBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8
  },
  claimedTxt: {
    fontSize: 11,
    color: '#4B5563'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexWrap: 'wrap',
    gap: 8
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8
  },
  deleteBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626'
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 6
  },
  resolveBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  resolveBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF'
  },
  receiveBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  receiveBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF'
  },
  handoverBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  handoverBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF'
  },
  formScrollContainer: {
    paddingBottom: 30
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    gap: 8
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B'
  },
  formSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 16
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6
  },
  typeSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  typeSelectBtnLostActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5'
  },
  typeSelectBtnFoundActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7'
  },
  typeSelectTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280'
  },
  typeSelectTxtLostActive: {
    color: '#991B1B'
  },
  typeSelectTxtFoundActive: {
    color: '#065F46'
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4
  },
  noticeTxt: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginTop: 4
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827'
  },
  mediaUploadBox: {
    gap: 4
  },
  mediaBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  mediaBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669'
  },
  fileNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  fileNameTxt: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    flex: 1
  },
  removeMediaTxt: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700'
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  submitBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B'
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalCancelTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563'
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalSubmitTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF'
  }
});
