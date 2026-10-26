/** Runs the multi-class comparison off the main thread so sliders stay smooth. */
import { compareFormations, type TeamConfig } from './model';

self.onmessage = (e: MessageEvent<{ config: TeamConfig; classes: number }>) => {
  const { config, classes } = e.data;
  self.postMessage({ result: compareFormations(config, classes) });
};
