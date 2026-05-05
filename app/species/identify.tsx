import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useCreateSpecies } from '@/hooks/useSpecies';
import { HudHeader } from '@/components/ui/HudHeader';
import { SpeciesClassification, DangerLevel } from '@/types-dtos/enums';

const CLASSIFICATIONS = Object.values(SpeciesClassification);
const DANGER_LEVELS = Object.values(DangerLevel);

export default function IdentifyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colors: tc } = theme;

  const { pickFromCamera, pickFromGallery, image, clearImage } = useImagePicker();
  const createSpecies = useCreateSpecies();

  const [name, setName] = useState('');
  const [classification, setClassification] = useState<SpeciesClassification | null>(null);
  const [dangerLevel, setDangerLevel] = useState<DangerLevel | null>(null);
  const [notes, setNotes] = useState('');

  const isValid = name.trim().length > 0 && classification !== null && dangerLevel !== null;
  const isSubmitting = createSpecies.isPending;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;
    try {
      await createSpecies.mutateAsync({
        name: name.trim(),
        classification: classification!,
        dangerLevel: dangerLevel!,
        notes: notes.trim() || undefined,
        imageUrl: image?.base64 ?? undefined,
      });
      router.back();
    } catch {
      Alert.alert('ERROR', 'No se pudo guardar la especie. Intenta de nuevo.');
    }
  };

  const chipStyle = (selected: boolean) => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: selected ? tc.primary : tc.border,
    backgroundColor: selected ? tc.primary + '33' : tc.surface,
    marginRight: 8,
    marginBottom: 8,
  });

  const chipTextStyle = (selected: boolean) => ({
    color: selected ? tc.primary : tc.textMuted,
    fontFamily: 'monospace' as const,
    fontSize: 9,
    letterSpacing: 1,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>✕ CERRAR</Text>
            </TouchableOpacity>
          </View>

          <HudHeader title="IDENTIFICACIÓN DE ESPECIE" subtitle="NUEVO REGISTRO" />

          {/* Image section */}
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            {image ? (
              <View>
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: '100%', height: 200, backgroundColor: tc.surfaceElevated }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={clearImage}
                  style={{ position: 'absolute', top: 8, right: 8, backgroundColor: tc.danger + 'CC', paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>ELIMINAR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', height: 200, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>SIN IMAGEN</Text>
              </View>
            )}
          </View>

          {/* Camera / Gallery / AI buttons */}
          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={pickFromCamera}
              style={{ flex: 1, borderWidth: 1, borderColor: tc.primary, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>CÁMARA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              style={{ flex: 1, borderWidth: 1, borderColor: tc.primary, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>GALERÍA</Text>
            </TouchableOpacity>
          </View>

          {/* IDENTIFICAR CON IA — disabled placeholder */}
          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <TouchableOpacity
              disabled
              style={{ borderWidth: 1, borderColor: tc.textDisabled, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: tc.textDisabled, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>IDENTIFICAR CON IA</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ marginHorizontal: 16 }}>
            {/* Name */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>NOMBRE *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="NOMBRE DE LA ESPECIE"
              placeholderTextColor={tc.textDisabled}
              style={{ borderWidth: 1, borderColor: tc.border, backgroundColor: tc.surface, color: tc.text, fontFamily: 'monospace', fontSize: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, letterSpacing: 1 }}
            />

            {/* Classification chips */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>CLASIFICACIÓN *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {CLASSIFICATIONS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setClassification(c)} style={chipStyle(classification === c)}>
                  <Text style={chipTextStyle(classification === c)}>{c.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Danger level chips */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>NIVEL DE PELIGRO *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {DANGER_LEVELS.map((d) => (
                <TouchableOpacity key={d} onPress={() => setDangerLevel(d)} style={chipStyle(dangerLevel === d)}>
                  <Text style={chipTextStyle(dangerLevel === d)}>{d.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>NOTAS</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="OBSERVACIONES OPCIONALES"
              placeholderTextColor={tc.textDisabled}
              multiline
              numberOfLines={4}
              style={{ borderWidth: 1, borderColor: tc.border, backgroundColor: tc.surface, color: tc.text, fontFamily: 'monospace', fontSize: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 24, letterSpacing: 1, textAlignVertical: 'top', minHeight: 80 }}
            />

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isValid || isSubmitting}
              style={{ borderWidth: 1, borderColor: isValid && !isSubmitting ? tc.primary : tc.textDisabled, backgroundColor: isValid && !isSubmitting ? tc.primary + '22' : 'transparent', paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: isValid && !isSubmitting ? tc.primary : tc.textDisabled, fontFamily: 'monospace', fontSize: 12, letterSpacing: 4 }}>
                {isSubmitting ? 'GUARDANDO...' : 'GUARDAR ESPECIE'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
