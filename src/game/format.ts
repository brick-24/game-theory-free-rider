/** Formatting helpers. Numbers go through Intl and render with a true minus sign. */
import { splitOutcome, type Action, type OutcomeKey } from './types';

const numberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 });
const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
const orListFormat = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' });

function clean(n: number): number {
  return Math.abs(n) < 1e-9 ? 0 : n;
}

export function fmt(n: number): string {
  return numberFormat.format(clean(n)).replace('-', '\u2212');
}

/** Always shows the sign: +2, −1.5, 0. */
export function fmtSigned(n: number): string {
  const v = clean(n);
  return v > 0 ? `+${fmt(v)}` : fmt(v);
}

export function fmtPercent(x: number): string {
  return percentFormat.format(clean(x));
}

export function fmtList(items: string[]): string {
  return listFormat.format(items);
}

export function fmtOrList(items: string[]): string {
  return orListFormat.format(items);
}

export const ACTION_LABEL: Record<Action, string> = {
  H: 'Choose Hard-Working Teammate',
  L: 'Choose Lazy Teammate',
};
export const ACTION_SHORT: Record<Action, string> = {
  H: 'Hard-Working',
  L: 'Lazy',
};

/** Compact label, Student A first: “High / Low”. */
export function outcomeShort(k: OutcomeKey): string {
  const [a, b] = splitOutcome(k);
  return `${ACTION_SHORT[a]} / ${ACTION_SHORT[b]}`;
}

/** Spoken label: “A high effort, B low effort”. */
export function outcomeLong(k: OutcomeKey): string {
  const [a, b] = splitOutcome(k);
  return `A ${ACTION_LABEL[a].toLowerCase()}, B ${ACTION_LABEL[b].toLowerCase()}`;
}

export function outcomeShortList(keys: OutcomeKey[]): string {
  return fmtList(keys.map(outcomeShort));
}

