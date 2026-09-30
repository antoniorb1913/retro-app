import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app.component';

/**
 * El componente raíz solo pinta el `<router-outlet />`, así que lo único que se comprueba aquí es
 * que arranca y que deja el enchufe de rutas en la página.
 *
 * (Este archivo venía de la plantilla de Angular: importaba `./app` y esperaba un
 * `<h1>Hello, retro-app</h1>` que ya no existe, así que hacía fallar **todos** los tests del
 * proyecto al arrancar. Ver la historia de la tarea de infraestructura de tests.)
 */
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('se crea el componente raíz', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deja el enchufe de rutas donde se cargan las pantallas', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('router-outlet')).toBeTruthy();
  });

  it('no pinta nada más: el armazón lo pone layout.component', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    // Si alguien mete aquí menús o cabeceras, se duplicarían con las del layout privado.
    expect(raiz.querySelector('nav, header, main')).toBeNull();
  });
});
