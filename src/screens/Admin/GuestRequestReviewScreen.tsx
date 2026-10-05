import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../services/api';

const GuestRequestReviewScreen = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tree-requests');
      setRequests(res.data?.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch guest requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/tree-requests/${id}/approve`);
      Alert.alert('Success', 'Request Approved and Applied to Tree');
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/tree-requests/${id}/reject`);
      Alert.alert('Rejected', 'Request Rejected and Removed');
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to reject request');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAdd = item.requestType === 'ADD_CHILD';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.requestType}>{isAdd ? 'ADD CHILD REQUEST' : 'EDIT NODE REQUEST'}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <Text style={styles.info}>Requester: {item.requesterName} (Ph: {item.requesterPhone})</Text>
        {item.requesterFatherName ? <Text style={styles.info}>Father: {item.requesterFatherName}</Text> : null}
        <Text style={styles.info}>Target Node: {item.targetNodeId?.name || 'Unknown'}</Text>
        
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>Reason:</Text>
          <Text style={styles.reasonText}>{item.requestReason}</Text>
        </View>

        <View style={styles.payloadContainer}>
          <Text style={styles.payloadTitle}>Requested Data:</Text>
          <Text style={styles.payloadText}>
            {JSON.stringify(item.requestedPayload, null, 2)}
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleApprove(item._id)}>
            <Text style={styles.btnText}>Approve & Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleReject(item._id)}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guest Tree Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No pending guest requests to review.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  status: {
    fontSize: 12,
    color: 'orange',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  reasonContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f4f8',
    borderRadius: 5,
  },
  reasonTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#444'
  },
  reasonText: {
    fontSize: 14,
    color: '#333'
  },
  payloadContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 15,
  },
  payloadTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    color: '#444'
  },
  payloadText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.danger,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GuestRequestReviewScreen;
