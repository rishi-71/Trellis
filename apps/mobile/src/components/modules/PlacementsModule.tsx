import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface PlacementsProps {
  token: string;
  backendUrl: string;
}

export default function PlacementsModule({ token, backendUrl }: PlacementsProps) {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);


  const fetchPlacementData = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/placements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch (err: any) {
      console.log('Error fetching placements:', err.message);
    }
  }, [backendUrl, token]);

  const handleApplyJob = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/placements/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Application submitted successfully!');
        fetchPlacementData();
      } else {
        Alert.alert('Failed', data.message || 'Already applied or ineligible.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPlacementData();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchPlacementData]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>💼 Careers & Placements</Text>
      <Text style={styles.sectionSub}>Active Recruitment Drives</Text>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />}

      {jobs.length === 0 ? (
        <Text style={styles.emptyText}>No placement drives active.</Text>
      ) : (
        jobs.map((job, idx) => (
          <View key={job._id || idx} style={styles.jobCard}>
            <Text style={styles.jobCompany}>{job.companyName}</Text>
            <Text style={styles.jobTitle}>{job.role}</Text>
            <Text style={styles.jobDesc}>{job.description}</Text>
            <TouchableOpacity style={styles.applyBtn} onPress={() => handleApplyJob(job._id)}>
              <Text style={styles.applyBtnText}>Submit Application</Text>
            </TouchableOpacity>
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
  jobCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  jobCompany: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 2,
  },
  jobDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: Spacing.two,
  },
  applyBtn: {
    backgroundColor: '#047857',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
