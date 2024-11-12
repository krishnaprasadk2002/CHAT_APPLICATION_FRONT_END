import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'chat', loadComponent: () => import('./component/chatmanagement/chatmangement.component').then(m => m.ChatmanagementComponent) },
    { path: 'register', component: RegisterComponent },
    { path: 'user-profile/:id', component: UserProfileComponent },
];
