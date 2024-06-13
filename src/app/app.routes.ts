import { Routes } from '@angular/router';
import { AuthGuard } from './services/guard';

export const routes: Routes = [
  

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    // canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'category',
    loadComponent: () => import('./pages/category/category.page').then( m => m.CategoryPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage),
    // canActivate: [AuthGuard]
  },
  {
    path: 'variations',
    loadComponent: () => import('./pages/variations/variations.page').then( m => m.VariationsPage),
    canActivate: [AuthGuard]
  }


];
