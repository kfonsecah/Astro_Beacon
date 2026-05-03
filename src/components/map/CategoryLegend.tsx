import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const categoryData = [
  { symbol: '🧪', label: 'Oxígeno', key: 'oxigeno' },
  { symbol: '💧', label: 'Agua', key: 'agua' },
  { symbol: '🍎', label: 'Comida', key: 'comida' },
  { symbol: '💊', label: 'Médico', key: 'medico' },
  { symbol: '🔧', label: 'Equipo', key: 'equipo' },
  { symbol: '📦', label: 'Otro', key: 'otro' },
];

export function CategoryLegend() {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const { colors: tc } = theme;

  return (
    <View style={{ backgroundColor: tc.surface, borderWidth: 1, borderColor: tc.border, padding: 8 }}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
          {expanded ? '▼' : '▶'} LEYENDA DE CATEGORÍAS
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={{ marginTop: 8, gap: 4 }}>
          {categoryData.map(cat => (
            <View key={cat.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14 }}>{cat.symbol}</Text>
              <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 9 }}>{cat.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
