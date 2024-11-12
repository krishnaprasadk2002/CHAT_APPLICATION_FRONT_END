import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css'
})
export class UserModalComponent {
  @Input() isModalOpen: boolean = false;
  @Input() userProfile: any = {};
  @Output() close = new EventEmitter<void>();  
  @Output() save = new EventEmitter<any>(); 

  profileImage: string | null = null; 

  // Handle image selection
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }
  

  // Close the modal
  closeModal(): void {
    this.close.emit();
  }

  // Save the profile changes and close the modal
  saveProfile(): void {
    this.userProfile.profileImage = this.profileImage; 
    this.save.emit(this.userProfile); 
    this.closeModal();
  }
}

