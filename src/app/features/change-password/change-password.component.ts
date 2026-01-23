import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
}) 
export class ChangePasswordComponent implements OnInit  {
toggleConfirmPassword() {
throw new Error('Method not implemented.');
}
  userId!: number;

oldPassword = '';
newPassword = '';
confirmPassword = '';
captcha = '';

constructor(private route: ActivatedRoute,private router: Router,private loginService: AdminService, private http: HttpClient
) {}

captchaUrl = '';
strengthMessage = '';
strengthColor = '';
strengthScore = 0;

errorMessage = '';
loading = false;



ngOnInit(): void {

  this.route.queryParams.subscribe(params => {
    console.log("Query params:", params);
    this.userId = Number(params['userId']);
    console.log("Loaded userId:", this.userId);
  });

  
  

  // Initialize CAPTCHA here (NOT at the top of the class)
    this.loadCaptcha();



}
loadCaptcha() {
  const url = this.loginService.captchaValidation();

  this.http.get(url, {
    responseType: 'blob',
    withCredentials: true
  }).subscribe(blob => {
    this.captchaUrl = URL.createObjectURL(blob);  // ✅ correct binding
  });
}

refreshCaptcha() {
  this.loadCaptcha();
}

// PASSWORD STRENGTH CHECKER (unchanged)
checkStrength() {
  const pwd = this.newPassword || '';
  let score = 0;

  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  this.strengthScore = score;

  if (score <= 2) {
    this.strengthMessage = 'Weak password';
    this.strengthColor = 'red';
  } else if (score === 3) {
    this.strengthMessage = 'Medium strength';
    this.strengthColor = 'orange';
  } else {
    this.strengthMessage = 'Strong password';
    this.strengthColor = 'green';
  }
}

passwordVisibility = {
  old: false,
  new: false,
  confirm: false
};

togglePassword(field: 'old' | 'new' | 'confirm') {
  this.passwordVisibility[field] = !this.passwordVisibility[field];
}



// SUBMIT
submit() {
  this.errorMessage = '';

  if (!this.newPassword || !this.confirmPassword || !this.captcha) {
    this.errorMessage = 'All fields are required';
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match';
    return;
  }

  if (this.strengthScore < 3) {
    this.errorMessage = 'Password is too weak';
    return;
  }

  this.loading = true;

  this.loginService.changePassword({UserID: this.userId,oldPassword: this.oldPassword,newPassword: this.newPassword,captchaToken: this.captcha}).subscribe({
    next: () => {
      Swal.fire({
  title: 'Password Updated',
  text: 'Please login again.',
  icon: 'success',
  confirmButtonText: 'OK'
});
      this.router.navigate(['/']);
    },
    error: err => {
      this.errorMessage = err.error?.message || 'Something went wrong';
      this.loading = false;
      this.refreshCaptcha(); // refresh on error
    }
  });
}

}
