import { Component, EventEmitter, Input, Output } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-common-upload',
  standalone: false,
  templateUrl: './common-upload.component.html',
  styleUrl: './common-upload.component.css'
})
export class CommonUploadComponent {
 
 @Input() screenName: string = '';
  @Input() visible: boolean = false;
  @Output() closePopup = new EventEmitter<void>();
  @Output() fileUploaded = new EventEmitter<File>();

  selectedFile: File | null = null;

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['application/vnd.ms-excel', 
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an Excel file (.xls or .xlsx)');
      return;
    }
    if (file.size > maxSize) {
      alert('File size exceeds 5MB. Please upload a smaller file.');
      return;
    }

    this.selectedFile = file;
  }

  upload(): void {
    if (this.selectedFile) {
      this.fileUploaded.emit(this.selectedFile);
      this.close();
    }
  }

  close(): void {
    this.closePopup.emit();
    this.selectedFile = null;
  }

  removeFile(): void {
    this.selectedFile = null;
  }
}
