import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/home/home.component').then((module) => module.HomeComponent),
    title: "Chaquill Chak'a | Hospédate en Cusco"
  },
  {
    path: 'habitaciones',
    loadComponent: () => import('./pages/rooms/rooms.component').then((module) => module.RoomsComponent),
    title: 'Habitaciones | Chaquill Chak’a'
  },
  {
    path: 'reserva',
    loadComponent: () => import('./pages/booking/booking.component').then((module) => module.BookingComponent),
    title: 'Haz una reservación | Chaquill Chak’a'
  },
  {
    path: 'ubicacion',
    loadComponent: () => import('./pages/location/location.component').then((module) => module.LocationComponent),
    title: 'Ubicación | Chaquill Chak’a'
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./pages/about/about.component').then((module) => module.AboutComponent),
    title: 'Nosotros | Chaquill Chak’a'
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
