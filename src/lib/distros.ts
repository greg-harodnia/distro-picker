import type { Distro } from './types';
import distrosData from './distros.json';

/**
 * The raw JSON import is structurally wider than `Distro`: optional fields
 * surface as always-present literals and `swap_strategy` widens to plain
 * `string`, which `exactOptionalPropertyTypes` rejects. The data is validated
 * at runtime by `validateDistrosArray`, so this single type-erasing cast at
 * the JSON boundary is safe.
 */
export const distros = distrosData.distros as unknown as Distro[];