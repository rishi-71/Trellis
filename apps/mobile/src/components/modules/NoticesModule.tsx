import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface NoticesProps {
  token: string;
  backendUrl: string;
}

export default function NoticesModule({ token, backendUrl }: NoticesProps) {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);



  const fetchNotices = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotices(data.notices);
    } catch (err: any) {
      console.log('Error fetching notices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotices();
    }, 0);
    return () => clearTimeout(t);
  }, [backendUrl, token]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📢 Notice Board</Text>
      <Text style={styles.sectionSub}>Official College Dispatches</Text>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      {notices.length === 0 ? (
        <Text style={styles.emptyText}>No notifications published.</Text>
      ) : (
        notices.map((n, idx) => (
          <View key={n._id || idx} style={styles.feedCard}>
            <Text style={styles.noticeTag}>{n.category?.toUpperCase() || 'GENERAL'}</Text>
            <Text style={styles.feedUser}>{n.title}</Text>
            <Text style={styles.feedText}>{n.content}</Text>
            <Text style={styles.feedTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
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
  sectionSub: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.two,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
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
  feedTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  noticeTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 2,
  },
});
