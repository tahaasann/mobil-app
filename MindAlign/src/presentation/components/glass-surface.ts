import { Platform } from 'react-native';

export type GlassSurfaceMode = 'liquid' | 'blur' | 'opaque';

type GlassSurfaceInput = {
  reduceTransparency: boolean;
  liquidGlassAvailable: boolean;
  platformOs: typeof Platform.OS;
};

export function resolveGlassSurfaceMode(input: GlassSurfaceInput): GlassSurfaceMode {
  if (input.reduceTransparency) {
    return 'opaque';
  }
  if (input.platformOs === 'ios' && input.liquidGlassAvailable) {
    return 'liquid';
  }
  return 'blur';
}
