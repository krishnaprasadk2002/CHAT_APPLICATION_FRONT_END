import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { alphabetsOnlyValidator, noWhitespaceValidator, passwordMatchValidator, strongPasswordValidator } from '../../shared/validators/formValidators';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private toastr: ToastrService, 
              private router: Router) {

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, alphabetsOnlyValidator(), noWhitespaceValidator()]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required, noWhitespaceValidator(), strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, noWhitespaceValidator()]]
    }, { validators: passwordMatchValidator });
  }

  // Handling form submission
  onSubmit() {
    if (this.registerForm.valid) {
        const { username, email, mobile, password } = this.registerForm.value;

        
        const userData = { 
            name: username, 
            email, 
            mobile, 
            password, 
        };

        this.authService.userRegister(userData).subscribe(
            response => {
                // Success toastr
                this.toastr.success('Registration successful', 'Success', {
                  timeOut: 5000,
                  closeButton: true,
                  progressBar: true
                });

                // Navigate to Login page
                this.router.navigate(['/']);
            },
            error => {
                // Error toastr
                this.toastr.error(error.error.message || 'Error during registration', 'Error');
            }
        );
    } else {
        this.registerForm.markAllAsTouched();
        // Warning toastr
        this.toastr.warning('Form is invalid', 'Warning');
    }
  }

  // Error checking for form controls
  hasError(controlName: string, errorName: string) {
    return this.registerForm.controls[controlName].hasError(errorName);
  }

  hasFormError(errorName: string) {
    return this.registerForm.hasError(errorName);
  }
}
