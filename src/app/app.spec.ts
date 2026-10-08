import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage?.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('shows the intro on each load', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Passer l'introduction");
  });

  it('opens the catalog once the intro is skipped', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const skip = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    skip.click();
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Découvrir');
    expect(compiled.textContent).toContain('100 cr');
  });
});
