import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminService, EmployeeProfile } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  profile!: EmployeeProfile;
  userId: number | null = null;
  profileImage: string | ArrayBuffer | null = null;
  isMobile = false;

  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  constructor(private profileService: AdminService) {}

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('UserId');

    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadProfile();
       // Load stored profile image from sessionStorage
      const savedImage = sessionStorage.getItem(`profileImage_${this.userId}`);
      if (savedImage) {
        this.profileImage = savedImage;
      }
    } else {
      console.error('No user logged in');
    }

        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  }

  loadProfile() {
    if (!this.userId) return;

    this.profileService.getProfile(this.userId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.profile = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading profile', err);
      }
    });
  }

openImageOptions() {
  Swal.fire({
    title: "Select Option",
    showCancelButton: true,
    confirmButtonText: "Open Camera",
    cancelButtonText: "Choose File"
  }).then((result) => {
    if (result.isConfirmed) {
      if (this.isMobile) {
        this.cameraInput.nativeElement.click();
      } else {
        Swal.fire('Camera not supported on desktop');
      }
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      this.galleryInput.nativeElement.click();
    }
  });
}



 onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.userId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.profileImage = reader.result;
        // Save image in sessionStorage
        sessionStorage.setItem(`profileImage_${this.userId}`, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

}
