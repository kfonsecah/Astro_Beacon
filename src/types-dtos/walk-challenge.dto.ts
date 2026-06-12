export interface WalkChallenge {
  _id: string;
  userId: string;
  distance: number;
  name: string;
  reward: {
    oxigeno: number;
    agua: number;
    comida: number;
    equipo: number;
  };
  status: 'available' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  gpsPoints: { lat: number; lng: number; timestamp: string }[];
}
