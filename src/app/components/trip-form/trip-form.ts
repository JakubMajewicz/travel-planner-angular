import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weather } from '../../services/weather';
import { WeatherModel } from '../../models/weather.model';

@Component({
  selector: 'app-trip-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './trip-form.html',
  styleUrl: './trip-form.css',
})
export class TripForm implements OnInit {
  // Odbieramy dane z kalendarza, gdzie kliknął użytkownik
  @Input() day!: string;
  @Input() hour!: string;

  // Emitujemy zdarzenia do kalendarza (zamknięcie lub zapis)
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private weatherService = inject(Weather);

  tripForm!: FormGroup;

  currentWeather: WeatherModel | null = null;
  isLoadingWeather = false;
  weatherError = false;

  ngOnInit() {
    // Inicjalizacja formularza z wymaganymi polami
    this.tripForm = this.fb.group({
      country: ['', Validators.required],
      city: ['', Validators.required],
      cost: [null, [Validators.required, Validators.min(0)]],
    });
  }

  // Metoda pobierająca pogodę na podstawie wpisanego miasta
  fetchWeather() {
    const city = this.tripForm.get('city')?.value;

    // Jeśli pole jest puste, nic nie robimy
    if (!city || city.trim() === '') return;

    this.isLoadingWeather = true;
    this.weatherError = false;
    this.currentWeather = null;

    this.weatherService.getWeatherForCity(city).subscribe({
      next: (data) => {
        this.currentWeather = new WeatherModel();
        this.currentWeather.cityName = data.location.name;
        this.currentWeather.temperature = data.current.temp_c;
        // Dodajemy 'https:' by uniknąć problemów z ładowaniem obrazka na localhost
        this.currentWeather.icon = 'https:' + data.current.condition.icon;
        this.currentWeather.text = data.current.condition.text;

        this.isLoadingWeather = false;
      },
      error: (err) => {
        console.error('Błąd pobierania pogody:', err);
        this.weatherError = true;
        this.isLoadingWeather = false;
      },
    });
  }

  onSubmit() {
    if (this.tripForm.valid) {
      // Łączymy wpisane dane z dniem i godziną klikniętego kafelka
      const tripData = {
        ...this.tripForm.value,
        dayOfWeek: this.day,
        timeSlot: this.hour,
        // Dodajemy informacje o pogodzie do obiektu wycieczki!
        weatherTemp: this.currentWeather?.temperature || null,
        weatherIcon: this.currentWeather?.icon || null
      };

      this.save.emit(tripData);
    }
  }

  onCancel() {
    this.close.emit();
  }
}
