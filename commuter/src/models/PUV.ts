export type VehicleType = 'Jeep' | 'Bus';

export interface PUV {
  name: string;
  type: VehicleType;
  plateNumber: string;
  route: string;
  location: {
    lng: number;
    lat: number;
  };
}
