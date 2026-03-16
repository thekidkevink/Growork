import { useAuth , useThemeColor } from '@/hooks';
import { Profile } from '@/types';
import { supabase } from '@/utils/supabase';
import { uploadImage, STORAGE_BUCKETS } from '@/utils/uploadUtils';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Feather } from '@expo/vector-icons';
import { ThemedInput } from '../ThemedInput';

type ProfileDetailsProps = {
  profile: Profile;
  editable?: boolean;
};

export default function ProfileDetails({
  profile,
  editable = false,
}: ProfileDetailsProps) {
  const { refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>(profile);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const displayName = [profile.name, profile.surname].filter(Boolean).join(" ").trim();
  const avatarUrl =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName || profile.username || "User"
    )}&size=100`;

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      updateProfile();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          name: editedProfile.name,
          surname: editedProfile.surname,
          bio: editedProfile.bio,
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const uri = result.assets[0].uri;
      setLoading(true);

      // Use the shared uploadImage function
      const publicUrl = await uploadImage({
        bucket: STORAGE_BUCKETS.AVATARS,
        userId: profile.id,
        uri,
        fileNamePrefix: 'avatar'
      });

      if (!publicUrl) {
        throw new Error('Failed to upload avatar');
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
          {editable && (
            <Pressable
              style={[styles.avatarEditButton, { borderColor }]}
              onPress={uploadAvatar}
              disabled={loading}
            >
              <Feather name="camera" size={16} color={textColor} />
            </Pressable>
          )}
        </View>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <>
              <ThemedInput
                value={editedProfile.name}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                placeholder="First Name"
                style={styles.editInput}
              />
              <ThemedInput
                value={editedProfile.surname}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, surname: text })}
                placeholder="Last Name"
                style={styles.editInput}
              />
              <ThemedInput
                value={editedProfile.username || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, username: text })}
                placeholder="Username"
                style={styles.editInput}
              />
            </>
          ) : (
            <>
              <ThemedText style={styles.name} type="defaultSemiBold">
                {displayName || "User"}
              </ThemedText>
              {profile.username && (
                <ThemedText style={styles.username}>@{profile.username}</ThemedText>
              )}
            </>
          )}
        </View>

        {editable && (
          <Pressable
            style={styles.editButton}
            onPress={handleEditToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={textColor} />
            ) : (
              <Feather
                name={isEditing ? 'check' : 'edit-2'}
                size={18}
                color={textColor}
              />
            )}
          </Pressable>
        )}
      </View>

      <View style={[styles.bioSection, { borderColor }]}>
        <ThemedText style={styles.bioLabel} type="defaultSemiBold">
          Bio
        </ThemedText>
        {isEditing ? (
          <ThemedInput
            value={editedProfile.bio || ''}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            style={styles.bioEditInput}
          />
        ) : (
          <ThemedText style={styles.bioText}>
            {profile.bio || 'No bio provided.'}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInput: {
    marginBottom: 8,
    height: 40,
  },
  bioSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  bioLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  bioText: {
    lineHeight: 22,
  },
  bioEditInput: {
    minHeight: 100,
    paddingTop: 8,
  },
});
