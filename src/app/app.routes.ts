import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { StockHomeComponent } from './pages/stock-home/stock-home';
import { StockComponent } from './pages/stock/stock';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'stock', component: StockHomeComponent },
  { path: 'stock/editar', component: StockComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];