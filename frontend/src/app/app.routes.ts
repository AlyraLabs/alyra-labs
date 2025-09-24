import { Routes } from '@angular/router';
import { IntroComponent } from './intro/intro.component';

export const routes: Routes = [
  { path: '', component: IntroComponent },
  { path: '**', redirectTo: '' }
];
