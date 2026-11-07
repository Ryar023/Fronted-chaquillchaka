import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccessibilitySpeechComponent } from './accessibility-speech.component';
import { BookingComponent } from './pages/booking/booking.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { WhatsappFloatingButtonComponent } from './components/whatsapp-floating-button/whatsapp-floating-button.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AccessibilitySpeechComponent,
    HttpClientModule,
    AppRoutingModule,
    NavbarComponent,
    BookingComponent,
    WhatsappFloatingButtonComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
