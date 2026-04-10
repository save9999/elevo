export type Parcours = 'PETITS' | 'EXPLORATEURS' | 'AVENTURIERS' | 'LYCEENS';

export interface Child {
  id: string;
  firstName: string;
  birthdate: Date;
  parcours: Parcours;
}
