import { describe, it, expect } from 'vitest';
import { computeParcours, routeForChild } from '../dispatch';

describe('computeParcours', () => {
  const today = new Date('2026-04-10');

  it('renvoie PETITS pour un enfant de 4 ans', () => {
    const birth = new Date('2022-04-10');
    expect(computeParcours(birth, today)).toBe('PETITS');
  });

  it('renvoie PETITS pour un enfant de 5 ans', () => {
    const birth = new Date('2021-01-10');
    expect(computeParcours(birth, today)).toBe('PETITS');
  });

  it('renvoie EXPLORATEURS pour un enfant de 6 ans', () => {
    const birth = new Date('2020-01-10');
    expect(computeParcours(birth, today)).toBe('EXPLORATEURS');
  });

  it('renvoie EXPLORATEURS pour un enfant de 9 ans', () => {
    const birth = new Date('2017-01-10');
    expect(computeParcours(birth, today)).toBe('EXPLORATEURS');
  });

  it('renvoie AVENTURIERS pour un enfant de 10 ans', () => {
    const birth = new Date('2016-01-10');
    expect(computeParcours(birth, today)).toBe('AVENTURIERS');
  });

  it('renvoie AVENTURIERS pour un enfant de 13 ans', () => {
    const birth = new Date('2012-06-10');
    expect(computeParcours(birth, today)).toBe('AVENTURIERS');
  });

  it('renvoie LYCEENS pour un enfant de 14 ans', () => {
    const birth = new Date('2012-01-10');
    expect(computeParcours(birth, today)).toBe('LYCEENS');
  });

  it('renvoie LYCEENS pour un enfant de 18 ans', () => {
    const birth = new Date('2007-11-10');
    expect(computeParcours(birth, today)).toBe('LYCEENS');
  });

  it('lève une erreur pour un enfant < 4 ans', () => {
    const birth = new Date('2023-01-10');
    expect(() => computeParcours(birth, today)).toThrow('age_out_of_range');
  });

  it('lève une erreur pour un enfant > 18 ans', () => {
    const birth = new Date('2006-01-10');
    expect(() => computeParcours(birth, today)).toThrow('age_out_of_range');
  });
});

describe('routeForChild', () => {
  it('renvoie /explorateurs/[id] pour parcours EXPLORATEURS', () => {
    expect(routeForChild({ id: 'c1', parcours: 'EXPLORATEURS' })).toBe('/explorateurs/c1');
  });

  it('renvoie /petits/[id] pour parcours PETITS', () => {
    expect(routeForChild({ id: 'c2', parcours: 'PETITS' })).toBe('/petits/c2');
  });

  it('renvoie /aventuriers/[id] pour parcours AVENTURIERS', () => {
    expect(routeForChild({ id: 'c3', parcours: 'AVENTURIERS' })).toBe('/aventuriers/c3');
  });

  it('renvoie /lyceens/[id] pour parcours LYCEENS', () => {
    expect(routeForChild({ id: 'c4', parcours: 'LYCEENS' })).toBe('/lyceens/c4');
  });
});
