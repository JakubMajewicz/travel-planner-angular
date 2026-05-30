import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripForm } from '../trip-form/trip-form';
import { Supabase } from '../../services/supabase';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, TripForm],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  private supabaseService = inject(Supabase);
  private cdr = inject(ChangeDetectorRef);

  hours: string[] = [];
  monthDays: Date[] = [];
  currentDate: Date = new Date();

  allTrips: Trip[] = [];

  isFormOpen = false;
  selectedDay = '';
  selectedHour = '';

  ngOnInit() {
    for (let i = 0; i < 24; i++) {
      this.hours.push(`${i.toString().padStart(2, '0')}:00`);
    }

    this.generateMonth(this.currentDate);

    this.supabaseService.loadTrips();
    this.supabaseService.listenRealtime();
    this.supabaseService.trips$.subscribe((trips) => {
      this.allTrips = trips;
      this.cdr.detectChanges();
    });
  }

  getTripsForDay(date: Date): Trip[] {
    const dateString = date.toISOString().split('T')[0];

    return this.allTrips.filter((trip) => trip.dayOfWeek === dateString);
  }

  generateMonth(date: Date) {
    this.monthDays = [];

    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);

    let startDay = firstDay.getDay();

    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
      this.monthDays.push(null as any);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      this.monthDays.push(new Date(year, month, d));
    }
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);

    this.generateMonth(this.currentDate);
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);

    this.generateMonth(this.currentDate);
  }

  onSlotClick(date: Date, hour: string) {
    this.selectedDay = date.toISOString().split('T')[0];
    this.selectedHour = hour;
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  async handleSaveTrip(tripData: Trip) {
    await this.supabaseService.addTrip(tripData);
    this.isFormOpen = false;
    this.cdr.detectChanges();
  }

  deleteTrip(event: Event, id: string | undefined) {
    event.stopPropagation();
    if (id) {
      this.supabaseService.deleteTrip(id);
    }
  }

  getWeatherForDay(date: Date) {
    const dateString = date.toISOString().split('T')[0];

    const trip = this.allTrips.find((t) => t.dayOfWeek === dateString);

    if (!trip?.weatherTemp) return null;

    return {
      temp: trip.weatherTemp,
      icon: trip.weatherIcon,
    };
  }
}
