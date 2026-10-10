import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { WhatsappFloatingButtonComponent } from './components/whatsapp-floating-button/whatsapp-floating-button.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NavbarComponent,
    WhatsappFloatingButtonComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
