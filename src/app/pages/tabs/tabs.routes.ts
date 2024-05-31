import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const tabRoutes: Routes =  [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
            loadComponent: () =>
              import('../choose-restaurant/choose-restaurant.page').then(m => m.ChooseRestaurantPage)
          }
      ,
      {
        path: 'tab2',
            loadComponent: () =>
              import('../history/history.page').then(m => m.HistoryPage)
         
      },
      {
        path: 'tab3',
            loadComponent: () =>
              import('../cart/cart.page').then(m => m.CartPage)
               },
      {
        path: 'tab4',
      
            loadComponent: () =>
              import('../account/account.page').then(m => m.AccountPage)
          
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

