import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdminService, DigitalCard } from '../../../admin/servies/admin.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-digital-business-card',
  standalone: false,
  templateUrl: './digital-business-card.component.html',
  styleUrl: './digital-business-card.component.css'
})
export class DigitalBusinessCardComponent implements OnInit {

  profile: DigitalCard | null = null;
  profileImage: string | ArrayBuffer | null = null;
@ViewChild('cameraInput') cameraInput!: ElementRef;
@ViewChild('galleryInput') galleryInput!: ElementRef;


  constructor(private adminService: AdminService) {}

 ngOnInit(): void {
  const userId = Number(sessionStorage.getItem('UserId'));
  if (!userId) return;

  // 🔁 instant UI from cache
  const cachedImage = sessionStorage.getItem(`profileImage_${userId}`);
  if (cachedImage) {
    this.profileImage = cachedImage;
  }

  this.adminService.getDigitalCard(userId).subscribe({
    next: (data) => {
      this.profile = data;

      if (data?.profileImagePath) {
        this.profileImage =
          'https://localhost:44370/' + data.profileImagePath;

        sessionStorage.setItem(
          `profileImage_${userId}`,
          this.profileImage
        );
      }
    },
    error: (err) => console.error(err)
  });
}



  // ------------------ DOWNLOAD PDF --------------------
  downloadPDF() {
    console.log("PDF button clicked");

    const cardElement = document.getElementById('card-section');
    if (!cardElement) {
      console.error("Card section not found!");
      return;
    }

    html2canvas(cardElement, { scale: 3 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`${this.profile?.fullName}-DigitalCard.pdf`);
    });
  }

  // ------------------ DOWNLOAD IMAGE --------------------
downloadImage() {
  const userId = Number(sessionStorage.getItem('UserId'));
  if (!userId) return;

  const url =
    `https://localhost:44370/api/UserManagement/DownloadProfileImage/${userId}`;

  const link = document.createElement('a');
  link.href = url;
  link.click();
}



  // ------------------ IMAGE UPLOAD --------------------
 onPhotoSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('Image', file);
  formData.append('UserId', sessionStorage.getItem('UserId')!);
  formData.append('CompanyId', sessionStorage.getItem('CompanyId')!);
  formData.append('RegionId', sessionStorage.getItem('RegionId')!);
  formData.append('CreatedBy', sessionStorage.getItem('UserId')!);

  this.adminService.uploadProfileImage(formData).subscribe({
    next: (res) => {
      this.profileImage =
        'https://localhost:44370/' + res.imagePath;

      sessionStorage.setItem(
        `profileImage_${sessionStorage.getItem('UserId')}`,
        this.profileImage
      );

      Swal.fire('Success', 'Profile image updated', 'success');
    }
  });
}

  openImageOptions() {
  Swal.fire({
    title: 'Select Option',
    showCancelButton: true,
    confirmButtonText: 'Open Camera',
    cancelButtonText: 'Choose File',
  }).then((result) => {
    if (result.isConfirmed) {
      this.cameraInput.nativeElement.click(); 
    } else {
      this.galleryInput.nativeElement.click(); 
    }
  });
}


  // Open the hidden file input
  // triggerFileUpload() {
  //   this.fileInput.nativeElement.click();
  // }
}
