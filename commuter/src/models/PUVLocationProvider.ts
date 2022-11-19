import { Ref, ComputedRef } from 'vue';
import { PUV } from './PUV';

export interface PUVLocationProvider {
  puvs: ComputedRef<PUV[]>;
}
