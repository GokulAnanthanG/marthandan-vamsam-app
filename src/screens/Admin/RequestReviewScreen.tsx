import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { familyRequestApi } from '../../services/api';

const RequestReviewScreen = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await familyRequestApi.getRequests();
      setRequests(res.data?.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await familyRequestApi.approveRequest(id);
      Alert.alert('Success', 'Request Approved');
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await familyRequestApi.rejectRequest(id, 'Rejected by Admin');
      Alert.alert('Rejected', 'Request Rejected');
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      await familyRequestApi.requestChanges(id, 'Please update with more accurate dates.');
      Alert.alert('Changes Requested', 'You have requested changes from the user.');
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to request changes');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.requestType}>{item.requestType.replace(/_/g, ' ')}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <Text style={styles.info}>Requested by: {item.requesterUserId?.fullName}</Text>
        <Text style={styles.info}>Target Node: {item.targetMemberId?.name}</Text>
        <View style={styles.payloadContainer}>
          <Text style={styles.payloadText}>
            {JSON.stringify(item.payloadJson, null, 2)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleApprove(item._id)}>
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.changeBtn]} onPress={() => handleRequestChanges(item._id)}>
            <Text style={styles.btnText}>Req Changes</Text>
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
      <Text style={styles.title}>Pending Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No pending requests to review.</Text>
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
    color: colors.text,
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
  payloadContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 15,
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
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  changeBtn: {
    backgroundColor: '#ff9800',
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

export default RequestReviewScreen;
