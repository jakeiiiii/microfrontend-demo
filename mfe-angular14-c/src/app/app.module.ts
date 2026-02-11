import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { MfeComponent } from './mfe.component';

@NgModule({
  declarations: [MfeComponent],
  imports: [BrowserModule],
  providers: [],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    if (!customElements.get('mfe-angular14-c')) {
      const element = createCustomElement(MfeComponent, { injector: this.injector });
      customElements.define('mfe-angular14-c', element);
    }
  }
}
