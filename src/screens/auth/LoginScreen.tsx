import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ImageBackground, Image, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Svg, { Path, Circle } from 'react-native-svg';
import { Lock, Shield, UserPlus, ChevronDown } from 'lucide-react-native';
import LanguageToggle from '../../components/common/LanguageToggle';

const { width, height } = Dimensions.get('window');

const HeritageDivider = () => (
  <Svg width="180" height="20" viewBox="0 0 180 20">
    <Path d="M20 10 L80 10" stroke="#C9A85A" strokeWidth="1" />
    <Path d="M100 10 L160 10" stroke="#C9A85A" strokeWidth="1" />
    <Circle cx="20" cy="10" r="2" fill="#C9A85A" />
    <Circle cx="160" cy="10" r="2" fill="#C9A85A" />
    {/* Diamond */}
    <Path d="M90 6 L94 10 L90 14 L86 10 Z" fill="#C9A85A" />
  </Svg>
);

const LeafOrnament = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24">
    <Path d="M11 22V15C11 13 9 12 7 11V9C10 10 11 12 12 13C13 12 14 10 17 9V11C15 12 13 13 13 15V22H11Z" fill="#C9A85A" />
    <Circle cx="12" cy="5" r="3.5" fill="#C9A85A" />
    <Circle cx="7" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="17" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="4.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="19.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="9" cy="3" r="2" fill="#C9A85A" />
    <Circle cx="15" cy="3" r="2" fill="#C9A85A" />
  </Svg>
);

const LoginScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert(t('error') || 'Error', 'Please enter a valid mobile number');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { mobileNumber });
      setOtpSent(true);
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert(t('error') || 'Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { mobileNumber, otp });
      const { user, accessToken, refreshToken } = response.data.data;
      
      await login(user, accessToken, refreshToken);
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <LanguageToggle />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerArea}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeHeading}>{t('welcomeBack')}</Text>
            <View style={{ height: 20, justifyContent: 'center', marginVertical: 4 }}>
              <HeritageDivider />
            </View>
            <Text style={styles.welcomeSub}>{t('welcomeSub')}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardOrnament}>
               <LeafOrnament />
            </View>
            
            <Text style={styles.cardTitle}>{t('login')}</Text>
            <View style={styles.cardDividerContainer}>
               <HeritageDivider />
            </View>

            <Text style={styles.inputLabel}>{otpSent ? t('otpLabel') : t('mobileNumber')}</Text>
            
            <View style={styles.inputGroup}>
              {!otpSent && (
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <ChevronDown size={14} color="#19352D" />
                </View>
              )}
              <TextInput
                style={styles.input}
                value={otpSent ? otp : mobileNumber}
                onChangeText={otpSent ? setOtp : setMobileNumber}
                keyboardType={otpSent ? "number-pad" : "phone-pad"}
                placeholder={otpSent ? t('enterOtp') : t('enterMobile')}
                placeholderTextColor="#7A847F"
                maxLength={otpSent ? 6 : undefined}
                underlineColorAndroid="transparent"
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={otpSent ? handleVerifyLogin : handleSendOtp}
              disabled={loading}
            >
              {!otpSent && <Lock size={16} color="#FFFFFF" style={{ marginRight: 8 }} />}
              <Text style={styles.primaryButtonText}>
                {loading ? t('loading') : (otpSent ? t('verifyLogin') : t('sendOtp'))}
              </Text>
            </TouchableOpacity>

            {!otpSent && (
              <View style={styles.securityNote}>
                <Shield size={12} color="#718078" style={{ marginRight: 6 }} />
                <Text style={styles.securityText}>{t('privacyNote')}</Text>
              </View>
            )}

            <View style={styles.orDividerContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.noAccountText}>{t('noAccount')}</Text>

            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Register')}
            >
              <UserPlus size={16} color="#004831" style={{ marginRight: 8 }} />
              <Text style={styles.outlineButtonText}>{t('register')}</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    position: 'relative',
    zIndex: 10,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.15,
    marginBottom: 0,
  },
  welcomeHeading: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: '#19352D',
    marginTop: 8,
  },
  welcomeSub: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    color: '#718078',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardOrnament: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: -5,
  },
  cardTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#19352D',
    textAlign: 'center',
  },
  cardDividerContainer: {
    alignItems: 'center',
    height: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: '#19352D',
    marginBottom: 6,
  },
  inputGroup: {
    flexDirection: 'row',
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F7F2',
    borderRightWidth: 1,
    borderColor: '#E5DDCF',
    paddingHorizontal: 12,
  },
  countryCodeText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#19352D',
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#19352D',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#004831',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  securityText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: '#718078',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DDCF',
  },
  orText: {
    marginHorizontal: 16,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: '#7A847F',
  },
  noAccountText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    color: '#718078',
    textAlign: 'center',
    marginBottom: 10,
  },
  outlineButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#004831',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    color: '#004831',
  }
});

export default LoginScreen;
