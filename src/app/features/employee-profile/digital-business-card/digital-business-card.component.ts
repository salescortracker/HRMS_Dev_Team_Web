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

    this.adminService.getDigitalCard(userId).subscribe({
      next: (data) => {
        console.log("Digital Card Data:", data);
        this.profile = data;

        // If backend already has image, show it
        if (this.profile?.profilePictureBase64) {
          this.profileImage = 'data:image/png;base64,' + this.profile.profilePictureBase64;
        }
      },
      error: (err) => console.error("Error loading digital card:", err)
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
  if (!this.profile?.profilePictureBase64) {
    console.error("No profile image to download!");
    return;
  }

  const imageData = "data:image/png;base64," + this.profile.profilePictureBase64;

  const link = document.createElement("a");
  link.href = imageData;
  link.download = `${this.profile?.fullName}-ProfileImage.png`;
  link.click();
}


  // ------------------ IMAGE UPLOAD --------------------
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      // preview image
      this.profileImage = reader.result;

      // save only Base64 part for backend
      const base64String = (reader.result as string).split(',')[1];
      if (this.profile) {
        this.profile.profilePictureBase64 = base64String;
      }
    };

    reader.readAsDataURL(file);
  }
  openImageOptions() {
  Swal.fire({
    title: 'Select Option',
    showCancelButton: true,
    confirmButtonText: 'Open Camera',
    cancelButtonText: 'Choose File',
  }).then((result) => {
    if (result.isConfirmed) {
      this.cameraInput.nativeElement.click(); // Open camera
    } else {
      this.galleryInput.nativeElement.click(); // Open gallery/file picker
    }
  });
}


  // Open the hidden file input
  // triggerFileUpload() {
  //   this.fileInput.nativeElement.click();
  // }
}
