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

interface CareerProps {
  token: string;
  backendUrl: string;
}

export default function CareerModule({ token, backendUrl }: CareerProps) {
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState('');


  const fetchCareerData = async () => {
    try {
      const feedRes = await fetch(`${backendUrl}/api/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const feedData = await feedRes.json();
      if (feedData.success) setFeed(feedData.activityFeed || feedData.feed || []);

      const lbRes = await fetch(`${backendUrl}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lbData = await lbRes.json();
      if (lbData.success) setLeaderboard(lbData.leaderboard || []);
    } catch (err: any) {
      console.log('Error fetching career data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/achievements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: "Shared an update", description: newPostText, category: "general" })
      });
      const data = await res.json();
      if (data.success) {
        setNewPostText('');
        fetchCareerData();
      }
    } catch (err) {
      Alert.alert('Error', 'Could not share post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCareerData();
    }, 0);
    return () => clearTimeout(t);
  }, [backendUrl, token]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>👥 Career Hub & Leaderboard</Text>

      <Text style={styles.label}>Publish Status Update</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="What's your latest co-curricular update?"
        value={newPostText}
        onChangeText={setNewPostText}
        multiline
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleCreatePost}>
        <Text style={styles.btnText}>Post to Campus Feed</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>Student Points Leaderboard 🏆</Text>
      {leaderboard.length === 0 ? (
        <Text style={styles.emptyText}>No leaderboard records.</Text>
      ) : (
        leaderboard.slice(0, 5).map((item, idx) => (
          <View key={item._id || idx} style={styles.itemRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.itemBold}>#{idx+1} {item.name}</Text>
              <Text style={styles.pointsText}>{item.cgpa * 10 + (item.verifiedAchievementsPoints || 0)} pts</Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <Text style={styles.sectionSub}>Recent Posts</Text>
      {feed.length === 0 ? (
        <Text style={styles.emptyText}>Feed is currently empty.</Text>
      ) : (
        feed.map((post, idx) => (
          <View key={post._id || idx} style={styles.feedCard}>
            <Text style={styles.feedUser}>{post.student?.name || 'Classmate'}</Text>
            <Text style={styles.feedText}>{post.description}</Text>
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
  feedCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: Spacing.three,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  feedUser: {
    fontWeight: 'bold',
    color: '#064E3B',
    fontSize: 13,
  },
  feedText: {
    color: '#374151',
    fontSize: 13,
    marginVertical: 4,
  },
  pointsText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: 'bold',
  },
});
