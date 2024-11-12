import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { noWhitespaceValidator } from '../../shared/validators/formValidators';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authServices: AuthService, private toastr: ToastrService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, noWhitespaceValidator()]],
      password: ['', [Validators.required, noWhitespaceValidator()]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authServices.userLogin(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Login successful!', 'Success');
            this.router.navigate(['/chat']);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          this.toastr.error('Login failed. Please try again.', 'Error');
          console.error('Login error:', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastr.error('Please fill in all fields correctly.', 'Error');
    }
  }

  hasError(controlName: string, errorName: string) {
    return this.loginForm.controls[controlName].hasError(errorName);
  }
}
