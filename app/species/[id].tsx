import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useTheme } from '@/hooks/use-theme';
import { useSpeciesById } from '@/hooks/useSpecies';
import { HudHeader } from '@/components/ui/HudHeader';

export default function SpeciesDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const theme = useTheme();
  const { colors: tc } = theme;

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const { data: species, isLoading, isError, refetch } = useSpeciesById(id!);

  const handleNarrate = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (!species) return;

    const textToSpeak = `${species.name}. Clasificación: ${species.classification}. Nivel de peligro: ${species.dangerLevel}. ${species.description || ''} ${species.notes ? 'Notas del explorador: ' + species.notes : ''}`;
    
    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: 'es-MX',
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 14, letterSpacing: 2 }}>ESPECIE NO ENCONTRADA</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={tc.primary} />
        <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 8, letterSpacing: 2 }}>CARGANDO ESPECIE...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !species) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tc.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, marginBottom: 8 }}>ERROR DE CARGA</Text>
        <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, textAlign: 'center', marginBottom: 16 }}>
          No se pudo obtener los datos de la especie.
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={{ borderWidth: 1, borderColor: tc.primary, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>REINTENTAR</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const classificationColors: Record<string, string> = {
    planta: tc.success,
    animal: tc.warning,
    recurso: tc.info,
    microorganismo: tc.primary,
    desconocido: tc.textMuted,
    otro: tc.textMuted,
  };
  const dangerColors: Record<string, string> = {
    amigable: tc.success,
    cauteloso: tc.warning,
    peligroso: tc.warning,
    letal: tc.danger,
  };

  const classColor = classificationColors[species.classification] ?? tc.textMuted;
  const dngColor = dangerColors[species.dangerLevel] ?? tc.textMuted;
  const confidence = species.confidence ?? species.iaConfidence;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>← VOLVER</Text>
          </TouchableOpacity>
        </View>

        <HudHeader title={species.name.toUpperCase()} subtitle="DETALLE DE ESPECIE" />

        {/* Image section */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          {species.imageUrl ? (
            <Image
              source={{ uri: species.imageUrl }}
              style={{ width: '100%', height: 200, backgroundColor: tc.surfaceElevated }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 200, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>SIN IMAGEN</Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: classColor + '33', borderWidth: 1, borderColor: classColor }}>
            <Text style={{ color: classColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>
              {species.classification.toUpperCase()}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: dngColor + '33', borderWidth: 1, borderColor: dngColor }}>
            <Text style={{ color: dngColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>
              {species.dangerLevel.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* AI Confidence */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border }}>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>CONFIANZA IA</Text>
          <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 }}>
            {confidence != null ? `${Math.round(confidence * 100)}%` : '--'}
          </Text>
        </View>

        {/* Description */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border }}>
          <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>DESCRIPCIÓN</Text>
          <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}>
            {species.description || '--'}
          </Text>
        </View>

        {/* Notes — only rendered if present */}
        {species.notes ? (
          <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border }}>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>NOTAS</Text>
            <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}>
              {species.notes}
            </Text>
          </View>
        ) : null}

        {/* NARRAR button */}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleNarrate}
            style={{ 
              borderWidth: 1, 
              borderColor: isSpeaking ? tc.danger : tc.primary, 
              backgroundColor: isSpeaking ? tc.danger + '22' : tc.primary + '22',
              paddingVertical: 12, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: isSpeaking ? tc.danger : tc.primary, fontFamily: 'monospace', fontSize: 12, letterSpacing: 4 }}>
              {isSpeaking ? 'DETENER' : 'NARRAR'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
