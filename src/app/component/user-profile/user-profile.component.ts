import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule,CommonModule,UserModalComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  userId: string = '';
  userProfile: any = {};
  isModalOpen = false

  constructor(
    private route: ActivatedRoute,
    private userService: ChatService  
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || ''; 
    
    if (this.userId) {
      this.fetchUserProfile(); 
    }
  }

  fetchUserProfile(): void {
    this.userService.getUserById(this.userId).subscribe(
      (data) => {
        this.userProfile = data;  
      },
      (error) => {
        console.error('Error fetching user profile:', error);  
      }
    );
  }

  
  // Open the edit modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Close the edit modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  saveProfile(updatedProfile: any): void {
    if (this.userProfile.profileImage) {
      updatedProfile.profileImage = this.userProfile.profileImage;
    }
  
    this.userService.updateUserProfile(this.userId, updatedProfile).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        this.userProfile = response; 
        this.closeModal();
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
}
