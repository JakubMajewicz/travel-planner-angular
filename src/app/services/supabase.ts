import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabase: SupabaseClient;

  // Tablica przechowująca stan naszych wycieczek
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  trips$ = this.tripsSubject.asObservable();

  constructor() {
    const supabaseUrl = 'https://akbbiifsthdrgxthxtno.supabase.co';
    const supabaseKey = 'sb_publishable_JWvTcThQqVJnYNfo6N3Lww_PqCIlOXj';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Pobieranie wszystkich wycieczek z bazy
  async loadTrips() {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      this.tripsSubject.next(data || []);
    } else {
      console.error('Błąd pobierania wycieczek:', error);
    }
  }

  // Dodawanie nowej wycieczki
  async addTrip(trip: Trip) {
    const { error } = await this.supabase.from('trips').insert(trip);

    if (error) {
      console.error('Błąd zapisu:', error);
    } else {
      this.loadTrips();
    }
  }

  // Opcjonalnie: Usuwanie wycieczki (jeśli chciałbyś to dodać w przyszłości)
  async deleteTrip(id: string) {
    const { error } = await this.supabase.from('trips').delete().eq('id', id);

    if (error) {
      console.error('Błąd usuwania:', error);
    } else {
      // Jeśli nie ma błędu, natychmiast odświeżamy listę!
      this.loadTrips();
    }
  }

  // Nasłuchiwanie zmian w czasie rzeczywistym (Realtime)
  listenRealtime() {
    this.supabase
      .channel('trips-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload: any) => {
        this.loadTrips(); // Odświeżamy listę przy każdej zmianie
      })
      .subscribe();
  }
}
