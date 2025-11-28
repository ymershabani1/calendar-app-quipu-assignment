import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';

export default function ProfileScreen() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
    checkBiometric();
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser({ email: currentUser.email });
    }
  };

  const checkBiometric = async () => {
    const available = await biometricService.isAvailable();
    const enabled = await authService.isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
        },
      },
    ]);
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      await authService.disableBiometric();
      setBiometricEnabled(false);
      Alert.alert('Success', 'Biometric authentication disabled');
    } else {
      setLoading(true);
      const success = await biometricService.setupBiometric();
      setLoading(false);
      if (success) {
        setBiometricEnabled(true);
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email || 'Loading...'}</Text>
        </View>

        <View style={styles.settingsSection}>
          {biometricAvailable && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <TouchableOpacity
                style={[styles.toggle, biometricEnabled && styles.toggleActive]}
                onPress={handleToggleBiometric}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.toggleText}>
                    {biometricEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  toggle: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});