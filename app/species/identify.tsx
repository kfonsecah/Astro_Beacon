import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
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
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedStyle, 
  cancelAnimation,
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useCreateSpecies, useIdentifySpecies } from '@/hooks/useSpecies';
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
  const identifySpecies = useIdentifySpecies();

  const [name, setName] = useState('');
  const [classification, setClassification] = useState<SpeciesClassification | null>(null);
  const [dangerLevel, setDangerLevel] = useState<DangerLevel | null>(null);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);

  // Animation values
  const scanY = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  const isScanning = identifySpecies.isPending;
  const isValid = name.trim().length > 0 && classification !== null && dangerLevel !== null;
  const isSubmitting = createSpecies.isPending;

  useEffect(() => {
    if (isScanning) {
      scanY.value = withRepeat(withTiming(200, { duration: 2000 }), -1, true);
      textOpacity.value = withRepeat(withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })), -1);
    } else {
      cancelAnimation(scanY);
      cancelAnimation(textOpacity);
      scanY.value = 0;
      textOpacity.value = 1;
    }
  }, [isScanning]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleIdentify = async () => {
    if (!image?.base64 || isScanning) {
      if (!image) Alert.alert('REQUERIDO', 'Captura o selecciona una imagen primero.');
      return;
    }

    try {
      const cleanBase64 = image.base64.replace(/^data:image\/\w+;base64,/, '');
      const result = await identifySpecies.mutateAsync(cleanBase64);
      
      setName(result.name);
      setClassification(result.classification);
      setDangerLevel(result.dangerLevel);
      setDescription(result.description);
      setNotes(''); // Leave notes empty for astronaut's manual observations
      setConfidence(result.confidence);
    } catch {
      Alert.alert('ERROR', 'ANÁLISIS NO DISPONIBLE — Completa los datos manualmente.');
    }
  };

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;
    try {
      await createSpecies.mutateAsync({
        name: name.trim(),
        classification: classification!,
        dangerLevel: dangerLevel!,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        imageUrl: image?.base64 ?? undefined,
        iaConfidence: confidence ?? undefined,
        classifiedByAI: confidence !== null,
      });
      router.back();
    } catch {
      Alert.alert('ERROR', 'No se pudo guardar la especie. Intenta de nuevo.');
    }
  };

  const getConfidenceColor = (val: number) => {
    if (val >= 0.75) return tc.success;
    if (val >= 0.5) return tc.warning;
    return tc.danger;
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
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ paddingVertical: 12, alignSelf: 'flex-start' }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, fontWeight: 'bold' }}>✕ CERRAR</Text>
            </TouchableOpacity>
          </View>

          <HudHeader 
            title="IDENTIFICACIÓN DE ESPECIE" 
            subtitle="NUEVO REGISTRO" 
            style={{ paddingHorizontal: 16, marginBottom: 16 }}
          />

          {/* Image section */}
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <View style={{ width: '100%', height: 200, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, overflow: 'hidden' }}>
              {image ? (
                <>
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  
                  {/* Scan Animation */}
                  {isScanning && (
                    <View style={{ ...View.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                      <Animated.View 
                        style={[
                          { 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            height: 2, 
                            backgroundColor: tc.primary,
                            shadowColor: tc.primary,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 5
                          }, 
                          scanStyle
                        ]} 
                      />
                      <Animated.Text style={[{ color: tc.primary, fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, fontWeight: 'bold' }, textStyle]}>
                        ANALIZANDO ESPÉCIMEN...
                      </Animated.Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={clearImage}
                    disabled={isScanning}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: tc.danger + 'CC', paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>ELIMINAR</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>SIN IMAGEN</Text>
                </View>
              )}
            </View>
          </View>

          {/* Camera / Gallery / AI buttons */}
          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={pickFromCamera}
              disabled={isScanning}
              style={{ flex: 1, borderWidth: 1, borderColor: isScanning ? tc.textDisabled : tc.primary, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: isScanning ? tc.textDisabled : tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>CÁMARA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              disabled={isScanning}
              style={{ flex: 1, borderWidth: 1, borderColor: isScanning ? tc.textDisabled : tc.primary, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: isScanning ? tc.textDisabled : tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>GALERÍA</Text>
            </TouchableOpacity>
          </View>

          {/* IDENTIFICAR CON IA */}
          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleIdentify}
              disabled={!image || isScanning}
              style={{ 
                borderWidth: 1, 
                borderColor: (!image || isScanning) ? tc.textDisabled : tc.primary, 
                backgroundColor: (!image || isScanning) ? 'transparent' : tc.primary + '22',
                paddingVertical: 10, 
                alignItems: 'center' 
              }}
            >
              <Text style={{ color: (!image || isScanning) ? tc.textDisabled : tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
                {isScanning ? 'ANALIZANDO...' : 'IDENTIFICAR CON IA'}
              </Text>
            </TouchableOpacity>
            
            {/* Confidence Display */}
            {confidence !== null && !isScanning && (
              <View style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ 
                  fontFamily: 'monospace', 
                  fontSize: 10, 
                  letterSpacing: 1,
                  color: confidence === 0 ? tc.textMuted : getConfidenceColor(confidence)
                }}>
                  CONFIANZA: {confidence === 0 ? 'N/D' : `${Math.round(confidence * 100)}%`}
                </Text>
              </View>
            )}
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

            {/* Description */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>DESCRIPCIÓN</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="DESCRIPCIÓN DE LA ESPECIE"
              placeholderTextColor={tc.textDisabled}
              multiline
              numberOfLines={8}
              style={{ borderWidth: 1, borderColor: tc.border, backgroundColor: tc.surface, color: tc.text, fontFamily: 'monospace', fontSize: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, letterSpacing: 1, textAlignVertical: 'top', minHeight: 160 }}
            />

            {/* Notes */}
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>NOTAS</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="OBSERVACIONES OPCIONALES"
              placeholderTextColor={tc.textDisabled}
              multiline
              numberOfLines={6}
              style={{ borderWidth: 1, borderColor: tc.border, backgroundColor: tc.surface, color: tc.text, fontFamily: 'monospace', fontSize: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 24, letterSpacing: 1, textAlignVertical: 'top', minHeight: 120 }}
            />

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isValid || isSubmitting || isScanning}
              style={{ borderWidth: 1, borderColor: isValid && !isSubmitting && !isScanning ? tc.primary : tc.textDisabled, backgroundColor: isValid && !isSubmitting && !isScanning ? tc.primary + '22' : 'transparent', paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: isValid && !isSubmitting && !isScanning ? tc.primary : tc.textDisabled, fontFamily: 'monospace', fontSize: 12, letterSpacing: 4 }}>
                {isSubmitting ? 'GUARDANDO...' : 'GUARDAR ESPECIE'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
