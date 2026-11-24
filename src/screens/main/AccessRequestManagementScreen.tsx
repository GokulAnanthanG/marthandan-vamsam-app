import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { accessRequestApi } from '../../services/api';
import {
  ShieldCheck,
  ShieldAlert,
  Home,
  Briefcase,
  Users,
  Heart,
  Store,
  ChevronLeft,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react-native';

const TABS = [
  { key: 'house', label: 'House', labelTa: 'இல்லம்', icon: Home, type: 'HOUSE' },
  { key: 'work', label: 'Work Address', labelTa: 'பணி முகவரி', icon: Briefcase, type: 'WORK_ADDRESS' },
  { key: 'employees', label: 'Employees', labelTa: 'பணியாளர்கள்', icon: Users, type: 'EMPLOYEES' },
  { key: 'varan', label: 'Varan (Matrimony)', labelTa: 'வரன்', icon: Heart, type: 'VARAN' },
  { key: 'business', label: 'Business', labelTa: 'வணிகம்', icon: Store, type: 'BUSINESS' }
];

interface AccessRequestManagementProps {
  navigation?: any;
}

const AccessRequestManagementScreen: React.FC<AccessRequestManagementProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAdmin = ['ADMIN', 'SUB_ADMIN'].includes(String(user?.role || '').toUpperCase());

  const [activeTab, setActiveTab] = useState('house');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  // Reject Modal State (Mandatory Rejection Reason - Requirement 6)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await accessRequestApi.getRequestsByTab(
        activeTab,
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      if (res.data?.data) {
        setRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.log('Error fetching access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      await accessRequestApi.approveRequest(id);
      Alert.alert(
        language === 'ta' ? 'அனுமதி வழங்கப்பட்டது' : 'Access Approved',
        language === 'ta'
          ? 'கோரிக்கையாளருக்கு அணுகல் வழங்கப்பட்டு அறிவிப்பு அனுப்பப்பட்டது.'
          : 'Access has been successfully approved and notification sent to requester.'
      );
      fetchRequests();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to approve request');
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert(
        language === 'ta' ? 'காரணம் தேவை' : 'Rejection Reason Required',
        language === 'ta'
          ? 'நிராகரிப்பதற்கான காரணத்தைக் கண்டிப்பாக உள்ளிட வேண்டும்.'
          : 'Please provide a clear reason for rejecting this access request.'
      );
      return;
    }

    if (!selectedRequestId) return;

    try {
      setSubmittingReject(true);
      await accessRequestApi.rejectRequest(selectedRequestId, rejectionReason.trim());
      Alert.alert(
        language === 'ta' ? 'கோரிக்கை நிராகரிக்கப்பட்டது' : 'Request Rejected',
        language === 'ta'
          ? 'காரணத்துடன் கோரிக்கை நிராகரிக்கப்பட்டு விண்ணப்பதாரருக்கு அறிவிக்கப்பட்டது.'
          : 'The request has been rejected and the reason communicated to the requester.'
      );
      setRejectModalVisible(false);
      fetchRequests();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reject request');
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#004831" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.screenTitle}>
            {language === 'ta' ? 'அணுகல் கோரிக்கை மேலாண்மை' : 'Access Request Management'}
          </Text>
          <Text style={styles.screenSubtitle}>
            {isAdmin
              ? (language === 'ta' ? 'நிர்வாகி அணுகல் ஒப்புதல் தளம்' : 'Administrator Central Approval Portal')
              : (language === 'ta' ? 'மையப்படுத்தப்பட்ட அனுமதி ஒப்புதல் தளம்' : 'Centralized Approval Control')}
          </Text>
        </View>
      </View>

      {/* 5 Distinct Tabs (Requirement 5.1 to 5.5) */}
      <View style={styles.tabsHeaderWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon size={16} color={isActive ? '#FFFFFF' : '#52635B'} />
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {language === 'ta' ? tab.labelTa : tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Filter Chips (All, Pending, Approved, Rejected) */}
      <View style={styles.statusFilterRow}>
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusChip,
              statusFilter === st && styles.statusChipActive
            ]}
            onPress={() => setStatusFilter(st)}
          >
            <Text
              style={[
                styles.statusChipText,
                statusFilter === st && styles.statusChipTextActive
              ]}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content Listing */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#004831" />
          <Text style={styles.loadingText}>
            {language === 'ta' ? 'கோரிக்கைகள் ஏற்றப்படுகின்றன...' : 'Loading access requests...'}
          </Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Clock size={44} color="#C5A059" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>
            {language === 'ta' ? 'கோரிக்கைகள் இல்லை' : 'No Access Requests'}
          </Text>
          <Text style={styles.emptySub}>
            {language === 'ta'
              ? 'இந்த பிரிவில் தற்போதைக்கு எந்த கோரிக்கையும் வரவில்லை.'
              : 'There are no access requests matching this filter tab.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {requests.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.requesterAvatar}>
                  <User size={20} color="#004831" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requesterName}>{item.requesterName}</Text>
                  <Text style={styles.requesterContact}>
                    {item.requesterEmail || item.requesterPhone || 'Member'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'APPROVED' && styles.statusBadgeApproved,
                    item.status === 'REJECTED' && styles.statusBadgeRejected
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'APPROVED' && { color: '#047857' },
                      item.status === 'REJECTED' && { color: '#B91C1C' }
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Specific details target */}
              {item.targetDetails && (
                <View style={styles.targetDetailsBox}>
                  <Text style={styles.targetLabel}>
                    {activeTab === 'varan'
                      ? 'Target Candidate Profile:'
                      : activeTab === 'house'
                      ? 'Target House:'
                      : 'Target Business / Professional:'}
                  </Text>
                  <Text style={styles.targetValue}>
                    {item.targetDetails.personName ||
                      item.targetDetails.businessName ||
                      item.targetDetails.fullName ||
                      'General Directory Access'}
                  </Text>
                </View>
              )}

              {/* Requirement 5.4: Prominently display requester's reason */}
              {item.reason ? (
                <View style={styles.reasonBox}>
                  <View style={styles.reasonHeader}>
                    <MessageSquare size={13} color="#8F6F1D" style={{ marginRight: 4 }} />
                    <Text style={styles.reasonHeaderTitle}>
                      {language === 'ta' ? 'கோரிக்கையாளர் குறிப்பிட்ட காரணம்:' : 'Requester Purpose / Reason:'}
                    </Text>
                  </View>
                  <Text style={styles.reasonContent}>{item.reason}</Text>
                </View>
              ) : null}

              {/* If Rejected, display rejection reason */}
              {item.status === 'REJECTED' && item.rejectionReason && (
                <View style={styles.rejectionNoticeBox}>
                  <AlertCircle size={13} color="#B91C1C" style={{ marginRight: 4 }} />
                  <Text style={styles.rejectionNoticeText}>
                    Rejection Reason: {item.rejectionReason}
                  </Text>
                </View>
              )}

              {/* Date */}
              <Text style={styles.dateText}>
                Submitted on {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>

              {/* Action Buttons for PENDING status */}
              {item.status === 'PENDING' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => openRejectModal(item.id)}
                    activeOpacity={0.8}
                  >
                    <X size={15} color="#DC2626" style={{ marginRight: 4 }} />
                    <Text style={styles.rejectBtnText}>
                      {language === 'ta' ? 'நிராகரி' : 'Reject'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.approveBtn,
                      approvingId === item.id && { opacity: 0.6 }
                    ]}
                    onPress={() => handleApprove(item.id)}
                    disabled={approvingId === item.id}
                    activeOpacity={0.8}
                  >
                    {approvingId === item.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Check size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.approveBtnText}>
                          {language === 'ta' ? 'அனுமதி வழங்கு' : 'Approve & Grant'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Rejection Reason Modal (Requirement 6: Mandatory Rejection Reason) */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ta' ? 'நிராகரிப்பு காரணத்தைக் குறிப்பிடவும்' : 'Specify Rejection Reason'}
              </Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {language === 'ta'
                ? 'அணுகல் கோரிக்கையை நிராகரிக்கக் காரணம் கட்டாயம் தேவை. இந்த காரணம் விண்ணப்பதாரருக்கு அறிவிக்கப்படும்:'
                : 'A rejection reason is required by community policy. This reason will be dispatched to the requester:'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={
                language === 'ta'
                  ? 'எ.கா: தவறான தகவல்கள் அல்லது சரிபார்க்கப்படாத சுயவிவரம்...'
                  : 'e.g., Incomplete verification, privacy preference, or unconfirmed identity...'
              }
              placeholderTextColor="#A3AEA8"
              multiline
              numberOfLines={3}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmRejectBtn,
                  submittingReject && { opacity: 0.7 }
                ]}
                onPress={handleConfirmReject}
                disabled={submittingReject}
              >
                {submittingReject ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmRejectBtnText}>
                    {language === 'ta' ? 'நிராகரிப்பை உறுதிசெய்' : 'Confirm Rejection'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F2'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2EDE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  titleWrap: {
    flex: 1
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19352D',
    fontFamily: 'Montserrat_700Bold'
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#718078',
    fontFamily: 'Montserrat_500Medium'
  },
  tabsHeaderWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0',
    height: 52
  },
  tabsScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3EFE6',
    gap: 6
  },
  tabButtonActive: {
    backgroundColor: '#004831'
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52635B'
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  statusFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 42,
    alignItems: 'center',
    gap: 8
  },
  statusChip: {
    paddingHorizontal: 12,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDCF'
  },
  statusChipActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  statusChipText: {
    fontSize: 11,
    color: '#718078',
    fontWeight: '600'
  },
  statusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#718078'
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19352D',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: '#718078',
    textAlign: 'center'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE0',
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  requesterAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#19352D',
    fontFamily: 'Montserrat_700Bold'
  },
  requesterContact: {
    fontSize: 11,
    color: '#718078',
    fontFamily: 'Montserrat_500Medium'
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeApproved: {
    backgroundColor: '#D1FAE5'
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2'
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309'
  },
  targetDetailsBox: {
    backgroundColor: '#F9F7F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 10
  },
  targetLabel: {
    fontSize: 10,
    color: '#8A9991',
    fontWeight: '600'
  },
  targetValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#19352D',
    marginTop: 1
  },
  reasonBox: {
    backgroundColor: '#FDFCF7',
    borderWidth: 1,
    borderColor: '#F3ECE0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  reasonHeaderTitle: {
    fontSize: 11,
    color: '#8F6F1D',
    fontWeight: '700'
  },
  reasonContent: {
    fontSize: 12,
    color: '#3B4842',
    lineHeight: 18
  },
  rejectionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8
  },
  rejectionNoticeText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600'
  },
  dateText: {
    fontSize: 10,
    color: '#A3AEA8',
    marginTop: 8
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7F4EC',
    paddingTop: 10
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 9,
    borderRadius: 8
  },
  rejectBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700'
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004831',
    paddingVertical: 9,
    borderRadius: 8
  },
  approveBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#19352D'
  },
  modalDesc: {
    fontSize: 12,
    color: '#718078',
    lineHeight: 18,
    marginBottom: 12
  },
  modalInput: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    alignItems: 'center'
  },
  cancelModalBtnText: {
    fontSize: 12,
    color: '#52635B',
    fontWeight: '600'
  },
  confirmRejectBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmRejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});

export default AccessRequestManagementScreen;
