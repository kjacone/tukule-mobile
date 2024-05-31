import { Routes } from '@angular/router';

export const routes: Routes = [
  
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.routes').then( m => m.tabRoutes)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },

  {
    path: 'category',
    loadComponent: () => import('./pages/category/category.page').then( m => m.CategoryPage)
  },
  {
    path: 'variations',
    loadComponent: () => import('./pages/variations/variations.page').then( m => m.VariationsPage)
  }


];
