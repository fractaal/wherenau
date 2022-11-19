export type VehicleType = 'Jeep' | 'Bus';

export interface PUV {
  name: string;
  type: VehicleType;
  plateNumber: string;
  location: {
    lng: number | null;
    lat: number | null;
  };
}
