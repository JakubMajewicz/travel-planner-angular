export interface Trip {
  id?: string;
  country: string;
  city: string;
  cost: number;
  dayOfWeek: string;
  timeSlot: string;
  weatherTemp?: number;
  weatherIcon?: string;
}
