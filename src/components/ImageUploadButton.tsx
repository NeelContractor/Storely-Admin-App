// src/components/ImageUploadButton.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker            from 'expo-image-picker';
import { Ionicons }                from '@expo/vector-icons';
import { useTheme }                from '../theme/ThemeContext';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';
import { colors }                  from '../theme/colors';
import { radii, typography }       from '../theme/typography';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImageUploadProps {
  uri?:         string;
  label:        string;
  onSuccess:    (url: string) => void;
  onRemove?:    () => void;
  small?:       boolean;
  aspectRatio?: [number, number];
  width?:       number;
  height?:      number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImageUploadButton: React.FC<ImageUploadProps> = ({
  uri, label, onSuccess, onRemove, small, aspectRatio, width, height,
}) => {
  const { colors: c } = useTheme();
  const [uploading, setUploading] = useState(false);
  // width/height props take priority; fall back to small flag then default
  const size = width ?? (small ? 64 : 100);
  const sizeH = height ?? size;

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:    ImagePicker.MediaTypeOptions.Images,
      quality:       0.85,
      allowsEditing: true,
      ...(aspectRatio ? { aspect: aspectRatio } : {}),
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      onSuccess(url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  // ── Has image ──────────────────────────────────────────────────────────────
  if (uri) {
    return (
      <View style={[styles.thumb, { width: size, height: sizeH }]}>
        <Image
          source={{ uri }}
          style={{ width: size, height: sizeH, borderRadius: radii.lg }}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.reuploadOverlay}
          onPress={pick}
          activeOpacity={0.7}
        >
          <View style={styles.reuploadInner}>
            <Ionicons name="camera-outline" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>
        {onRemove && (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={onRemove}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Empty placeholder ──────────────────────────────────────────────────────
  return (
    <TouchableOpacity
      style={[
        styles.placeholder,
        { width: size, height: sizeH, borderColor: c.border, backgroundColor: c.card },
      ]}
      onPress={pick}
      disabled={uploading}
      activeOpacity={0.75}
    >
      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Ionicons name="cloud-upload-outline" size={small ? 20 : 26} color={colors.primary} />
          <Text style={[styles.label, { color: c.textSecondary, fontSize: small ? 9 : 10 }]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  thumb: {
    position: 'relative',
  },
  reuploadOverlay: {
    position:        'absolute',
    bottom:          4,
    right:           4,
  },
  reuploadInner: {
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  removeBtn: {
    position: 'absolute',
    top:      -6,
    right:    -6,
  },
  placeholder: {
    borderWidth:    1.5,
    borderStyle:    'dashed',
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            4,
  },
  label: {
    textAlign:  'center',
    fontWeight: typography.weights.medium,
    paddingHorizontal: 4,
  },
});