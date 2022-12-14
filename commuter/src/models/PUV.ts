export type VehicleType = 'Jeep' | 'Bus';

export interface PUV {
  name: string;
  type: VehicleType;
  plateNumber: string;
  route: string;
  image: string;
  location: {
    lng: number;
    lat: number;
  };
  color: string;
}
