import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

// Física estilo nave de Geometry Dash:
// mantener presionado = acelera hacia arriba, soltar = cae por gravedad
const GRAVITY = 1700;        // px/s²
const THRUST = 3400;         // px/s² hacia arriba mientras se presiona
const MAX_VY = 600;          // velocidad terminal px/s
const SHIP_X = 56;
const SHIP_W = 34;
const SHIP_H = 22;
const TARGET_SCORE = 18;     // meteoritos a esquivar para autorizar el despliegue
const BASE_METEOR_SPEED = 310;
const HIT_MARGIN = 3;        // tolerancia de colisión (px)
const TRAIL_LIFE = 0.3;      // segundos de vida de la estela

// Récord de la sesión
let bestScore = 0;

interface Meteor {
  id: number;
  x: number;
  baseY: number;
  y: number;
  size: number;
  counted: boolean;
  speedMul: number;     // velocidad individual
  driftAmp: number;     // amplitud de deriva vertical
  driftFreq: number;
  driftPhase: number;
  rot: number;
  rotSpeed: number;
  age: number;
  craters: { x: number; y: number; s: number }[];
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  tint: boolean;
}

interface Streak {
  x: number;
  y: number;
  w: number;
  speed: number;
}

interface TrailDot {
  x: number;
  y: number;
  t: number;
}

type Phase = 'idle' | 'playing' | 'failed' | 'won';

interface SupplyRunGameProps {
  visible: boolean;
  onComplete: () => void;
  onAbort: () => void;
}

function makeMeteor(id: number, w: number, h: number, score: number): Meteor {
  const size = 18 + Math.random() * 20;
  const driftAmp = 8 + Math.random() * (18 + Math.min(score, 14) * 1.5);
  return {
    id,
    x: w + size,
    baseY: driftAmp + Math.random() * Math.max(1, h - size - driftAmp * 2),
    y: 0,
    size,
    counted: false,
    speedMul: 0.85 + Math.random() * 0.55,
    driftAmp,
    driftFreq: 1.5 + Math.random() * 2.5,
    driftPhase: Math.random() * Math.PI * 2,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 120),
    age: 0,
    craters: Array.from({ length: 3 }, () => ({
      x: 0.15 + Math.random() * 0.55,
      y: 0.15 + Math.random() * 0.55,
      s: 0.12 + Math.random() * 0.16,
    })),
  };
}

function DustPuff({ dir, color }: { dir: number; color: string }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.quad) });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dir * 30 * p.value },
      { translateY: -8 * p.value },
      { scale: 0.6 + 0.8 * p.value },
    ],
    opacity: 1 - p.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', bottom: -2, left: 8, width: 12, height: 6, borderRadius: 3, backgroundColor: color },
        style,
      ]}
    />
  );
}

// Escena final: el cohete desciende y aterriza sobre un planeta giratorio
function LandingScene({ onFinished }: { onFinished: () => void }) {
  const { colors: tc } = useTheme();
  const { width: W, height: H } = useWindowDimensions();
  const [landed, setLanded] = useState(false);

  const PLANET = Math.min(W * 1.1, 420);
  const planetTop = H - PLANET * 0.40;
  const ROCKET_W = 30;
  const ROCKET_H = 62;
  const startY = H * 0.06;
  const endY = planetTop - ROCKET_H + 4;

  const drop = useSharedValue(0);
  const spin = useSharedValue(0);

  // Cráteres de la superficie (patrón que se repite para girar en bucle)
  const craters = useMemo(
    () =>
      Array.from({ length: 7 }, () => ({
        x: Math.random() * PLANET,
        y: 0.05 + Math.random() * 0.45,
        s: 14 + Math.random() * 30,
      })),
    [PLANET],
  );

  const sceneStars = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.75,
        size: Math.random() < 0.25 ? 2 : 1,
      })),
    [W, H],
  );

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 10000, easing: Easing.linear }), -1, false);
    drop.value = withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setLanded)(true);
    });
  }, []);

  useEffect(() => {
    if (!landed) return;
    const t = setTimeout(onFinished, 1200);
    return () => clearTimeout(t);
  }, [landed]);

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: startY + (endY - startY) * drop.value },
      { rotate: `${Math.sin(drop.value * Math.PI * 2) * 2}deg` },
    ],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drop.value, [0, 0.9, 1], [1, 0.9, 0]),
    transform: [{ scaleY: interpolate(drop.value, [0, 1], [1.1, 0.45]) }],
  }));

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -PLANET * spin.value }],
  }));

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0B1120' }}>
      {/* Estrellas */}
      {sceneStars.map((st, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: st.x, top: st.y, width: st.size, height: st.size, backgroundColor: '#9CA3AF', opacity: st.size === 2 ? 0.8 : 0.4 }}
        />
      ))}

      {/* Texto de estado */}
      <View style={{ position: 'absolute', top: H * 0.16, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ color: tc.success, fontFamily: 'monospace', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>
          {landed ? '◉ SUMINISTRO EN SUPERFICIE' : '◉ DESPLIEGUE AUTORIZADO'}
        </Text>
        <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 }}>
          {landed ? 'CONFIRMANDO POSICIÓN...' : 'INICIANDO SECUENCIA DE ATERRIZAJE'}
        </Text>
      </View>

      {/* Atmósfera del planeta */}
      <View
        style={{
          position: 'absolute',
          top: planetTop - 10,
          left: W / 2 - (PLANET + 20) / 2,
          width: PLANET + 20,
          height: PLANET + 20,
          borderRadius: (PLANET + 20) / 2,
          borderWidth: 2,
          borderColor: tc.primary + '22',
        }}
      />

      {/* Planeta con superficie giratoria */}
      <View
        style={{
          position: 'absolute',
          top: planetTop,
          left: W / 2 - PLANET / 2,
          width: PLANET,
          height: PLANET,
          borderRadius: PLANET / 2,
          backgroundColor: '#1F2937',
          borderWidth: 1.5,
          borderColor: tc.primary + '55',
          overflow: 'hidden',
        }}
      >
        {/* Franja de cráteres en bucle (ilusión de rotación) */}
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, width: PLANET * 2, height: PLANET }, stripStyle]}>
          {[0, PLANET].map((offset) =>
            craters.map((c, i) => (
              <View
                key={`${offset}-${i}`}
                style={{
                  position: 'absolute',
                  left: offset + c.x,
                  top: c.y * PLANET,
                  width: c.s,
                  height: c.s,
                  borderRadius: c.s / 2,
                  backgroundColor: '#11182788',
                  borderWidth: 1,
                  borderColor: tc.primary + '22',
                }}
              />
            )),
          )}
        </Animated.View>

        {/* Sombreado: terminador y luz */}
        <View style={{ position: 'absolute', top: 0, right: -PLANET * 0.3, width: PLANET, height: PLANET, borderRadius: PLANET / 2, backgroundColor: '#0B1120AA' }} />
        <View style={{ position: 'absolute', top: PLANET * 0.04, left: PLANET * 0.16, width: PLANET * 0.32, height: PLANET * 0.1, borderRadius: PLANET * 0.06, backgroundColor: tc.primary + '14', transform: [{ rotate: '-18deg' }] }} />
      </View>

      {/* Cohete aterrizando */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: W / 2 - ROCKET_W / 2, width: ROCKET_W, height: ROCKET_H }, rocketStyle]}>
        {/* nariz */}
        <View style={{ position: 'absolute', top: 0, left: 5, width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: tc.primary }} />
        {/* cuerpo */}
        <View style={{ position: 'absolute', top: 16, left: 5, width: 20, height: 30, backgroundColor: tc.primary + '33', borderWidth: 1.5, borderColor: tc.primary }} />
        {/* ventana */}
        <View style={{ position: 'absolute', top: 24, left: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B1120', borderWidth: 1, borderColor: tc.primary }} />
        {/* aletas */}
        <View style={{ position: 'absolute', top: 38, left: -2, width: 0, height: 0, borderTopWidth: 0, borderBottomWidth: 10, borderRightWidth: 8, borderBottomColor: 'transparent', borderRightColor: tc.primary, borderTopColor: 'transparent' }} />
        <View style={{ position: 'absolute', top: 38, right: -2, width: 0, height: 0, borderTopWidth: 0, borderBottomWidth: 10, borderLeftWidth: 8, borderBottomColor: 'transparent', borderLeftColor: tc.primary, borderTopColor: 'transparent' }} />
        {/* llama de frenado */}
        <Animated.View style={[{ position: 'absolute', top: 46, left: 9 }, flameStyle]}>
          <View style={{ width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FB923C' }} />
        </Animated.View>
        {/* polvo al aterrizar */}
        {landed && (
          <>
            <DustPuff dir={-1} color={tc.primary + '66'} />
            <DustPuff dir={1} color={tc.primary + '66'} />
            <DustPuff dir={-0.5} color={'#9CA3AF66'} />
            <DustPuff dir={0.5} color={'#9CA3AF66'} />
          </>
        )}
      </Animated.View>
    </View>
  );
}

export function SupplyRunGame({ visible, onComplete, onAbort }: SupplyRunGameProps) {
  const { colors: tc } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('idle');
  const [, setFrame] = useState(0);

  const area = useRef({ w: winW, h: winH * 0.7 });
  const holding = useRef(false);
  const meteorId = useRef(0);
  const game = useRef({
    y: 200,
    vy: 0,
    score: 0,
    spawnTimer: 0,
    meteors: [] as Meteor[],
    trail: [] as TrailDot[],
    time: 0,
  });

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 22 }, () => ({
        x: Math.random() * winW,
        y: Math.random() * winH,
        size: Math.random() < 0.25 ? 2 : 1,
        speed: 18 + Math.random() * 50,
        tint: Math.random() < 0.2,
      })),
    [winW, winH],
  );
  const starsRef = useRef(stars);

  const streaks = useMemo<Streak[]>(
    () =>
      Array.from({ length: 6 }, () => ({
        x: Math.random() * winW,
        y: Math.random() * winH,
        w: 26 + Math.random() * 46,
        speed: 520 + Math.random() * 420,
      })),
    [winW, winH],
  );
  const streaksRef = useRef(streaks);

  const resetGame = () => {
    game.current = {
      y: area.current.h / 2,
      vy: 0,
      score: 0,
      spawnTimer: 0.55,
      meteors: [],
      trail: [],
      time: 0,
    };
    holding.current = false;
  };

  // Reiniciar al abrir
  useEffect(() => {
    if (visible) {
      setPhase('idle');
      resetGame();
    }
  }, [visible]);

  // Loop principal
  useEffect(() => {
    if (!visible || phase !== 'playing') return;

    let raf = 0;
    let last: number | null = null;

    const loop = (now: number) => {
      if (last == null) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const s = game.current;
      const { w, h } = area.current;
      s.time += dt;

      // Física de la nave
      s.vy += (holding.current ? -THRUST : GRAVITY) * dt;
      s.vy = Math.max(-MAX_VY, Math.min(MAX_VY, s.vy));
      s.y += s.vy * dt;
      if (s.y < 0) { s.y = 0; s.vy = 0; }
      if (s.y > h - SHIP_H) { s.y = h - SHIP_H; s.vy = 0; }

      // Estela de la nave: los puntos se lanzan hacia atrás con la velocidad del mundo
      const worldSpeed = BASE_METEOR_SPEED + s.score * 11;
      s.trail.push({ x: SHIP_X + 2, y: s.y + SHIP_H / 2, t: 0 });
      for (const d of s.trail) {
        d.t += dt;
        d.x -= worldSpeed * dt;
      }
      s.trail = s.trail.filter((d) => d.t < TRAIL_LIFE && d.x > -6);

      // Fondo: estrellas y líneas de velocidad
      for (const st of starsRef.current) {
        st.x -= st.speed * dt;
        if (st.x < -2) st.x = w + 2;
      }
      for (const sk of streaksRef.current) {
        sk.x -= sk.speed * dt;
        if (sk.x < -sk.w) {
          sk.x = w + Math.random() * 80;
          sk.y = Math.random() * h;
        }
      }

      // Spawn de meteoritos (densidad creciente, a veces en pares)
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.meteors.push(makeMeteor(meteorId.current++, w, h, s.score));
        if (s.score >= 5 && Math.random() < 0.35) {
          s.meteors.push(makeMeteor(meteorId.current++, w + 60 + Math.random() * 60, h, s.score));
        }
        s.spawnTimer = Math.max(0.3, 0.78 - s.score * 0.028);
      }

      // Mover meteoritos + colisiones + puntaje
      const speed = worldSpeed;
      let crashed = false;
      for (const m of s.meteors) {
        m.age += dt;
        m.x -= speed * m.speedMul * dt;
        m.rot += m.rotSpeed * dt;
        m.y = m.baseY + Math.sin(m.age * m.driftFreq + m.driftPhase) * m.driftAmp;

        if (!m.counted && m.x + m.size < SHIP_X) {
          m.counted = true;
          s.score += 1;
        }

        const overlapX = SHIP_X + HIT_MARGIN < m.x + m.size - HIT_MARGIN && SHIP_X + SHIP_W - HIT_MARGIN > m.x + HIT_MARGIN;
        const overlapY = s.y + HIT_MARGIN < m.y + m.size - HIT_MARGIN && s.y + SHIP_H - HIT_MARGIN > m.y + HIT_MARGIN;
        if (overlapX && overlapY) crashed = true;
      }
      s.meteors = s.meteors.filter((m) => m.x > -m.size);

      if (crashed) {
        bestScore = Math.max(bestScore, s.score);
        setPhase('failed');
        return;
      }
      if (s.score >= TARGET_SCORE) {
        bestScore = Math.max(bestScore, s.score);
        setPhase('won');
        return;
      }

      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, phase]);

  const s = game.current;
  const progressPct = Math.min(100, Math.round((s.score / TARGET_SCORE) * 100));
  const tilt = Math.max(-24, Math.min(24, s.vy / 13));
  const flameLen = 8 + (holding.current ? 5 : 0) + Math.random() * 4;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onAbort}>
      <View style={{ flex: 1, backgroundColor: '#0B1120' }}>
        {/* HUD superior */}
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: tc.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
              DESPLIEGUE DE SUMINISTRO
            </Text>
            <TouchableOpacity onPress={onAbort}>
              <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>✕ ABORTAR</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, height: 5, backgroundColor: tc.primary + '22', flexDirection: 'row' }}>
              <View style={{ width: `${progressPct}%`, height: 5, backgroundColor: progressPct >= 75 ? tc.success : tc.primary }} />
            </View>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>
              {s.score}/{TARGET_SCORE}
            </Text>
          </View>
        </View>

        {/* Zona de juego */}
        <Pressable
          style={{ flex: 1 }}
          onLayout={(e) => {
            area.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
          }}
          onPressIn={() => { holding.current = true; }}
          onPressOut={() => { holding.current = false; }}
          onPress={() => {
            if (phase === 'idle') {
              resetGame();
              setPhase('playing');
            }
          }}
        >
          {/* Puntaje gigante de fondo */}
          {phase === 'playing' && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: tc.primary + '14', fontFamily: 'monospace', fontSize: 130 }}>
                {s.score}
              </Text>
            </View>
          )}

          {/* Estrellas */}
          {starsRef.current.map((st, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: st.x,
                top: st.y % Math.max(1, area.current.h),
                width: st.size,
                height: st.size,
                backgroundColor: st.tint ? tc.primary : '#9CA3AF',
                opacity: st.size === 2 ? 0.85 : 0.4,
              }}
            />
          ))}

          {/* Líneas de velocidad */}
          {phase === 'playing' && streaksRef.current.map((sk, i) => (
            <View
              key={`sk-${i}`}
              style={{
                position: 'absolute',
                left: sk.x,
                top: sk.y,
                width: sk.w,
                height: 1,
                backgroundColor: tc.primary,
                opacity: 0.12,
              }}
            />
          ))}

          {/* Techo y suelo */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: tc.primary + '55' }} />
          <View style={{ position: 'absolute', top: 3, left: 0, right: 0, height: 1, backgroundColor: tc.primary + '22' }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: tc.primary + '55' }} />
          <View style={{ position: 'absolute', bottom: 3, left: 0, right: 0, height: 1, backgroundColor: tc.primary + '22' }} />

          {/* Estela de la nave */}
          {phase === 'playing' && s.trail.map((d, i) => (
            <View
              key={`t-${i}`}
              style={{
                position: 'absolute',
                left: d.x - 3,
                top: d.y - 2,
                width: 5,
                height: 4,
                backgroundColor: tc.primary,
                opacity: (1 - d.t / TRAIL_LIFE) * 0.4,
              }}
            />
          ))}

          {/* Meteoritos */}
          {phase !== 'idle' && s.meteors.map((m) => (
            <View
              key={m.id}
              style={{
                position: 'absolute',
                left: m.x,
                top: m.y,
                width: m.size,
                height: m.size,
                borderRadius: m.size / 2,
                borderWidth: 1.5,
                borderColor: '#FB923C',
                backgroundColor: 'rgba(251,146,60,0.13)',
                transform: [{ rotate: `${m.rot}deg` }],
              }}
            >
              {m.craters.map((c, ci) => (
                <View
                  key={ci}
                  style={{
                    position: 'absolute',
                    left: c.x * m.size,
                    top: c.y * m.size,
                    width: c.s * m.size,
                    height: c.s * m.size,
                    borderRadius: (c.s * m.size) / 2,
                    backgroundColor: '#FB923C66',
                  }}
                />
              ))}
            </View>
          ))}

          {/* Nave */}
          {phase !== 'idle' && (
            <View
              style={{
                position: 'absolute',
                left: SHIP_X,
                top: s.y,
                width: SHIP_W,
                height: SHIP_H,
                transform: [{ rotate: `${tilt}deg` }],
              }}
            >
              {/* propulsor con parpadeo */}
              {phase === 'playing' && (
                <View style={{ position: 'absolute', left: -flameLen, top: 7, width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderRightWidth: flameLen, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: holding.current ? '#FB923C' : '#FB923C66' }} />
              )}
              {/* cuerpo */}
              <View style={{ position: 'absolute', left: 0, top: 4, width: 20, height: 14, backgroundColor: tc.primary + '33', borderWidth: 1.5, borderColor: tc.primary }} />
              {/* aleta */}
              <View style={{ position: 'absolute', left: 2, top: 0, width: 8, height: 5, backgroundColor: tc.primary + '55' }} />
              {/* nariz */}
              <View style={{ position: 'absolute', left: 20, top: 4, width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 14, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: tc.primary }} />
              {/* cabina */}
              <View style={{ position: 'absolute', left: 11, top: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: '#0B1120', borderWidth: 1, borderColor: tc.primary }} />
            </View>
          )}

          {/* Pantalla de inicio */}
          {phase === 'idle' && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 14, letterSpacing: 3, marginBottom: 16 }}>
                MISIÓN DE DESPLIEGUE
              </Text>
              <Text style={{ color: tc.text, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, textAlign: 'center', lineHeight: 18, marginBottom: 8 }}>
                MANTÉN PRESIONADA LA PANTALLA{'\n'}PARA ELEVAR LA NAVE
              </Text>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, textAlign: 'center', lineHeight: 16, marginBottom: 12 }}>
                ESQUIVA {TARGET_SCORE} METEORITOS PARA{'\n'}AUTORIZAR EL DESPLIEGUE
              </Text>
              {bestScore > 0 && (
                <Text style={{ color: tc.warning, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 20 }}>
                  RÉCORD DE SESIÓN: {bestScore}
                </Text>
              )}
              <View style={{ borderWidth: 1, borderColor: tc.primary, paddingVertical: 12, paddingHorizontal: 28 }}>
                <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>
                  [ TOCA PARA INICIAR ]
                </Text>
              </View>
            </View>
          )}
        </Pressable>

        {/* Overlay de fallo */}
        {phase === 'failed' && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,17,32,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ color: tc.danger, fontFamily: 'monospace', fontSize: 16, letterSpacing: 3, marginBottom: 10 }}>
              ⬡ NAVE DESTRUIDA
            </Text>
            <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>
              METEORITOS ESQUIVADOS: {s.score}/{TARGET_SCORE}
            </Text>
            <Text style={{ color: tc.warning, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 26 }}>
              RÉCORD DE SESIÓN: {bestScore}
            </Text>
            <TouchableOpacity
              onPress={() => { resetGame(); setPhase('playing'); }}
              style={{ borderWidth: 1, borderColor: tc.primary, paddingVertical: 12, paddingHorizontal: 28, marginBottom: 12 }}
            >
              <Text style={{ color: tc.primary, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>
                [ REINTENTAR ]
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAbort} style={{ paddingVertical: 8, paddingHorizontal: 28 }}>
              <Text style={{ color: tc.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
                ABORTAR MISIÓN
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Victoria: animación de aterrizaje en el planeta */}
        {phase === 'won' && <LandingScene onFinished={onComplete} />}
      </View>
    </Modal>
  );
}
