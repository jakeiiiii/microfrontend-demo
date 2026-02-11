import { createApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { MfeComponent } from './app/mfe.component';

(async () => {
  const app = await createApplication({
    providers: [provideZoneChangeDetection({ eventCoalescing: true })]
  });

  if (!customElements.get('mfe-angular20-c')) {
    const MfeElement = createCustomElement(MfeComponent, { injector: app.injector });
    customElements.define('mfe-angular20-c', MfeElement);
  }
})();
