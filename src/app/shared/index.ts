import { Provider } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonSegmentButton,IonSegment,IonThumbnail,IonSkeletonText,IonSearchbar,IonSelect,IonSelectOption,IonTabs, IonTabButton, IonLabel, IonTabBar,IonButtons,IonBackButton,IonRow, IonCol,IonInput,IonSpinner,IonItem,IonText,IonList, IonIcon,IonHeader, IonToolbar, IonTitle, IonContent,IonCard,
    IonFooter,IonBadge,IonCardHeader,IonCardTitle,IonCardSubtitle,IonCardContent,
    IonButton } from '@ionic/angular/standalone';

    import { TranslateModule } from '@ngx-translate/core';
    

export const SHARED: Provider[] = [  
    IonButtons,IonBackButton,IonRow,IonCol,IonInput,IonSpinner, IonItem,IonText,IonList,IonCardContent,IonSearchbar,IonSelect,IonSelectOption,
     IonCardHeader,IonCardTitle,IonCardSubtitle,IonHeader, IonToolbar, IonTitle, IonContent,IonCard,IonButton,IonSegmentButton,IonSegment,IonFooter,
    CommonModule, FormsModule,IonIcon,IonTabs, IonTabButton, IonLabel, IonTabBar,IonThumbnail,IonSkeletonText,IonBadge,


    TranslateModule

];