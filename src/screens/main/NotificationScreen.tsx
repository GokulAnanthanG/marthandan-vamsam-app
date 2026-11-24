import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { notificationApi } from '../../services/api';
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Home,
  Briefcase,
  Store,
  Heart,
  Users,
  Calendar,
  Sparkles,
  Info,
  Clock
} from 'lucide-react-native';

interface NotificationScreenProps {
  navigation?: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({
        unreadOnly: unreadOnly || undefined,
        limit: 50
      });
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log('Error marking all notifications as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HOUSE':
        return <Home size={18} color="#004831" />;
      case 'WORK_ADDRESS':
        return <Briefcase size={18} color="#0284C7" />;
      case 'BUSINESS':
        return <Store size={18} color="#D97706" />;
      case 'VARAN':
        return <Heart size={18} color="#BE185D" />;
      case 'EMPLOYEES':
        return <Users size={18} color="#7C3AED" />;
      case 'EVENT':
        return <Calendar size={18} color="#2563EB" />;
      default:
        return <Sparkles size={18} color="#C5A059" />;
    }
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'HOUSE':
        return { backgroundColor: '#EBF4EE', color: '#004831' };
      case 'WORK_ADDRESS':
        return { backgroundColor: '#F0F9FF', color: '#0369A1' };
      case 'BUSINESS':
        return { backgroundColor: '#FFFBEB', color: '#B45309' };
      case 'VARAN':
        return { backgroundColor: '#FCE7F3', color: '#9D174D' };
      case 'EMPLOYEES':
        return { backgroundColor: '#F5F3FF', color: '#6D28D9' };
      default:
        return { backgroundColor: '#FDF6E2', color: '#8F6F1D' };
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
            {language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
          </Text>
          <Text style={styles.screenSubtitle}>
            {language === 'ta' ? 'அணுகல் கோரிக்கைகள் & ஒப்புதல் செய்திகள்' : 'Access Updates & Community Alerts'}
          </Text>
        </View>

        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markingAll}
            activeOpacity={0.7}
          >
            <CheckCheck size={16} color="#004831" style={{ marginRight: 4 }} />
            <Text style={styles.markAllText}>
              {language === 'ta' ? 'அனைத்தும் வாசித்தவை' : 'Mark all read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !unreadOnly && styles.filterChipActive]}
          onPress={() => setUnreadOnly(false)}
        >
          <Text style={[styles.filterChipText, !unreadOnly && styles.filterChipTextActive]}>
            {language === 'ta' ? 'அனைத்து அறிவிப்புகள்' : 'All Updates'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, unreadOnly && styles.filterChipActive]}
          onPress={() => setUnreadOnly(true)}
        >
          <Text style={[styles.filterChipText, unreadOnly && styles.filterChipTextActive]}>
            {language === 'ta' ? 'படிக்காதவை மட்டும்' : 'Unread Only'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#004831" />
          <Text style={styles.loadingText}>
            {language === 'ta' ? 'அறிவிப்புகள் ஏற்றப்படுகின்றன...' : 'Loading notifications...'}
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Bell size={44} color="#C5A059" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>
            {language === 'ta' ? 'புதிய அறிவிப்புகள் இல்லை' : 'No Notifications'}
          </Text>
          <Text style={styles.emptySub}>
            {language === 'ta'
              ? 'அணுகல் கோரிக்கைகள் மற்றும் நிகழ்வு புதுப்பிப்புகள் இங்கே தோன்றும்.'
              : 'Access requests, approval notifications and community updates will appear here.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item) => {
            const badgeColors = getCategoryBadgeStyle(item.category);
            const isRejection = item.type === 'REQUEST_REJECTED';
            const isApproval = item.type === 'REQUEST_APPROVED' || item.type === 'ACCESS_GRANTED';

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  !item.isRead && styles.notificationCardUnread
                ]}
                onPress={() => handleMarkAsRead(item.id, item.isRead)}
                activeOpacity={0.8}
              >
                <View style={styles.notifTopRow}>
                  <View style={styles.iconContainer}>
                    {getCategoryIcon(item.category)}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.titleBadgeRow}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.categoryBadge, { backgroundColor: badgeColors.backgroundColor }]}>
                        <Text style={[styles.categoryBadgeText, { color: badgeColors.color }]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                  </View>

                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                {/* Prominently Highlight Rejection Reason (Requirement 6) */}
                {isRejection && item.rejectionReason && (
                  <View style={styles.rejectionReasonContainer}>
                    <ShieldAlert size={14} color="#B91C1C" style={{ marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rejectionLabel}>Rejection Reason Provided:</Text>
                      <Text style={styles.rejectionReasonValue}>{item.rejectionReason}</Text>
                    </View>
                  </View>
                )}

                {/* Access Granted Badge (Requirement 6) */}
                {isApproval && (
                  <View style={styles.approvalBadgeBox}>
                    <ShieldCheck size={14} color="#047857" style={{ marginRight: 6 }} />
                    <Text style={styles.approvalBadgeText}>
                      Access automatically unlocked in directory
                    </Text>
                  </View>
                )}

                {/* Footer Time & Sender */}
                <View style={styles.notifFooter}>
                  {item.sender?.name ? (
                    <Text style={styles.senderText}>
                      From: {item.sender.name}
                    </Text>
                  ) : <View />}

                  <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleDateString()} •{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EBF4EE'
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004831'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3EFE6'
  },
  filterChipActive: {
    backgroundColor: '#004831'
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52635B'
  },
  filterChipTextActive: {
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
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE0',
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#C5A059',
    backgroundColor: '#FFFEFA'
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3EFE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#19352D',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    marginRight: 6
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700'
  },
  notifMessage: {
    fontSize: 12,
    color: '#4A5B53',
    lineHeight: 18,
    fontFamily: 'Montserrat_500Medium'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5A059',
    marginTop: 6
  },
  rejectionReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginTop: 10
  },
  rejectionLabel: {
    fontSize: 10,
    color: '#991B1B',
    fontWeight: '700'
  },
  rejectionReasonValue: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
    marginTop: 1
  },
  approvalBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8
  },
  approvalBadgeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600'
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7F4EC',
    paddingTop: 6
  },
  senderText: {
    fontSize: 10,
    color: '#8A9991',
    fontWeight: '500'
  },
  timeText: {
    fontSize: 10,
    color: '#A3AEA8'
  }
});

export default NotificationScreen;
