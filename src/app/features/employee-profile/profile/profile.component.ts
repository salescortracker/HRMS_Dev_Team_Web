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
  userId!: number;
  companyId!: number;
  regionId!: number;
  profileImage: string | ArrayBuffer | null = null;
  isMobile = false;

  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  constructor(private profileService: AdminService) {}

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }
    const storedUserId = sessionStorage.getItem('UserId');

    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadProfile();
       // Load stored profile image from sessionStorage
      // const savedImage = sessionStorage.getItem(`profileImage_${this.userId}`);
      // if (savedImage) {
      //   this.profileImage = savedImage;
      // }
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

        // 👇 load image from DB
       if (this.profile.profilePicture) {
  this.profileImage =
    'https://localhost:44370/' + this.profile.profilePicture;
}

      }
    },
    error: (err) => {
      console.error('Error loading profile', err);
    }
  });
}


openImageOptions() {
  
  Swal.fire({
    title: 'Select Option',
    showCancelButton: true,
    confirmButtonText: 'Open Camera',
    cancelButtonText: 'Choose File'
  }).then((result) => {

    if (result.isConfirmed) {
      // Camera
      if (this.isMobile) {
        this.cameraInput.nativeElement.click();
      } else {
        Swal.fire('Camera not supported on desktop');
      }
    }

    if (result.dismiss === Swal.DismissReason.cancel) {
      // Gallery
      this.galleryInput.nativeElement.click();
    }
  });
}



onPhotoSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file || !this.userId) return;

  // 🔒 Size validation (1MB)
  if (file.size > 1024 * 1024) {
    Swal.fire('Error', 'Image size must be less than 1MB', 'error');
    return;
  }

  // 🔹 Preview immediately
  const reader = new FileReader();
  reader.onload = () => {
    this.profileImage = reader.result;
  };
  reader.readAsDataURL(file);

  // 🔥 SEND MULTIPART FORM DATA
  const formData = new FormData();
  formData.append('Image', file);
  formData.append('UserId', this.userId.toString());
  formData.append('CompanyId', this.companyId.toString());
  formData.append('RegionId', this.regionId.toString());
  formData.append('CreatedBy', this.userId.toString());

  this.profileService.uploadProfileImage(formData).subscribe({
    next: (res) => {
      Swal.fire('Success', 'Profile image updated successfully', 'success');

      // 🔁 cache image for other screens
      // sessionStorage.setItem(
      //   `profileImage_${this.userId}`,
      //   this.profileImage as string
      // );
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to upload image', 'error');
    }
  });

  // reset inputs
  this.cameraInput.nativeElement.value = '';
  this.galleryInput.nativeElement.value = '';
}

viewProfileImage() {
  if (!this.profileImage) {
    Swal.fire('No Image', 'Profile image not available', 'info');
    return;
  }

  Swal.fire({
    title: 'Profile Image',
    imageUrl: this.profileImage as string,
    imageAlt: 'Profile Image',
    showCloseButton: true,
    showConfirmButton: false,
    width: '400px',
    imageWidth: 450,
    imageHeight: 550,
    backdrop: true
  });
}


}
