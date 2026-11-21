import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { AccessibilitySpeechComponent } from './accessibility-speech.component';
import { BookingComponent } from './pages/booking/booking.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { WhatsappFloatingButtonComponent } from './components/whatsapp-floating-button/whatsapp-floating-button.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AccessibilitySpeechComponent,
    HttpClientModule,
    AppRoutingModule,
    BottomNavComponent,
    NavbarComponent,
    BookingComponent,
    WhatsappFloatingButtonComponent,
    ChatboxComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
