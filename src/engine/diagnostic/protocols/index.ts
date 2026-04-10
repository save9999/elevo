import { alouetteProtocol } from './alouette';
import { odedysLectureProtocol } from './odedys-lecture';
import { odedysDicteeProtocol } from './odedys-dictee';
import { subitisationProtocol } from './subitisation';
import { corsiProtocol } from './corsi';
import type { Protocol } from './types';

export const PROTOCOLS: Protocol[] = [
  alouetteProtocol,
  odedysLectureProtocol,
  odedysDicteeProtocol,
  subitisationProtocol,
  corsiProtocol,
];

export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}

export { alouetteProtocol, odedysLectureProtocol, odedysDicteeProtocol, subitisationProtocol, corsiProtocol };
export type { Protocol } from './types';
