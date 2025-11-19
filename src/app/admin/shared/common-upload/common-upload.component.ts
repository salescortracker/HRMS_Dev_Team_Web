import { Component, EventEmitter, Input, Output } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AdminService } from '../../servies/admin.service';
@Component({
  selector: 'app-common-upload',
  standalone: false,
  templateUrl: './common-upload.component.html',
  styleUrl: './common-upload.component.css'
})
export class CommonUploadComponent {
  @Input() model: { name: string; structure: any } | null = null;
   @Input() visible = false;
  @Input() screenName = 'Master Data';
  selectedFile: File | null = null;
  fileData: any[] = [];

  constructor(private adminService: AdminService) {}

  close() {
    this.visible = false;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      this.selectedFile = file;
      this.readExcel(file);
    } else {
      alert('Invalid file or file too large (max 5 MB).');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      this.selectedFile = file;
      this.readExcel(file);
    }
  }

  readExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.fileData = XLSX.utils.sheet_to_json(sheet);
      console.log('Excel Data:', this.fileData);
    };
    reader.readAsArrayBuffer(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.fileData = [];
  }

  upload() {
    if (this.fileData.length === 0) {
      alert('No data found in the Excel file.');
      return;
    }

    // Call backend API to insert data
  this.adminService.bulkInsertData('Company', this.fileData).subscribe({
  next: (res: any) => {
    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Upload Complete',
        text: res.message,
        confirmButtonColor: '#007bff'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Upload Completed with Warnings',
        text: res.message || 'Some records could not be processed.',
        confirmButtonColor: '#f39c12'
      });
    }

    this.selectedFile = null;
    this.close();
  },
  error: (err) => {
    console.error('Error while uploading:', err);
    const message =
      err?.error?.message ||
      err?.message ||
      'Upload failed. Please contact IT Administrator.';

    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: message,
      confirmButtonColor: '#dc3545'
    });
  }
});


  }

  /** Download sample Excel template */
downloadTemplate() {
  if (!this.model || !Array.isArray(this.model) || this.model.length === 0) {
    Swal.fire('Error', 'Model data missing or invalid!', 'error');
    return;
  }

  try {
    // Convert model data directly to worksheet
    const worksheet = XLSX.utils.json_to_sheet(this.model);

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Company Template');

    // File name based on screenName or fallback
    const fileName = this.screenName
      ? `${this.screenName}_Template.xlsx`
      : 'Template.xlsx';

    // Download Excel
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel template:', error);
    Swal.fire('Error', 'Failed to generate template file.', 'error');
  }
}


  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) return;

    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      this.fileData = XLSX.utils.sheet_to_json(ws, { raw: true });
    };
    reader.readAsBinaryString(file);
  }
}
