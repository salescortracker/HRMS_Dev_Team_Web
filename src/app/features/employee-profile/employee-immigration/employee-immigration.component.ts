import { Component, OnInit } from '@angular/core';
import { EmployeeImmigration } from '../../../admin/servies/admin.service';
import { AdminService } from '../../../admin/servies/admin.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-immigration',
  standalone: false,
  templateUrl: './employee-immigration.component.html',
  styleUrls: ['./employee-immigration.component.css']
})
export class EmployeeImmigrationComponent implements OnInit {
  today: string = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  immigrationList: EmployeeImmigration[] = [];
  formModel: EmployeeImmigration = {} as EmployeeImmigration;
  isEditMode = false;
  visaTypes: any[] = [];
  workStatuses: any[] = [];
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));
  userId!: number;

  // File state & errors
  passportFile: File | null = null;
  visaFile: File | null = null;
  otherFile: File | null = null;

  passportFileError: string | null = null;
  visaFileError: string | null = null;
  otherFileError: string | null = null;

  isSubmitting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
    }
    this.loadImmigrations();
    this.loadVisaTypes();
    this.loadStatuses();
  }

  loadVisaTypes(): void {
    this.adminService.getVisaTypes().subscribe({
      next: (data) => {
        this.visaTypes = data;
        console.log("Visa Types Loaded:", data);
      },
      error: (err) => console.error("Failed to load visa types", err)
    });
  }

  loadStatuses(): void {
    this.adminService.getStatuses().subscribe({
      next: (data) => {
        this.workStatuses = data;
        console.log("Statuses Loaded:", data);
      },
      error: (err) => console.error("Failed to load statuses", err)
    });
  }

  loadImmigrations(): void {
    this.adminService.getAllEmployeeImmigrations().subscribe({
      next: (data) => {
        console.log('Loaded immigration data:', data);
        this.immigrationList = data; // <-- this binds data to your HTML table
      },
      error: (err) => console.error('Error loading immigration data', err)
    });
  }

  // Ensure passport is uppercase as user types
  onPassportInput(event: any): void {
    const val = event.target.value || '';
    const upper = val.toUpperCase();
    event.target.value = upper;
    this.formModel.passportNumber = upper;
  }

  // Called when visa issue/expiry change to allow client checks
  onVisaDateChange(): void {
    // nothing heavy here; validations will be performed on submit
  }

  // File validations: type and size
  onFileChange(event: any, field: string) {
    const file: File | undefined = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    // Reset error for the field
    if (field === 'passportCopy') this.passportFileError = null;
    if (field === 'visaCopy') this.visaFileError = null;
    if (field === 'otherDocs') this.otherFileError = null;

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSizeBytes) {
      const msg = 'File size should not exceed 5 MB.';
      if (field === 'passportCopy') this.passportFileError = msg;
      if (field === 'visaCopy') this.visaFileError = msg;
      if (field === 'otherDocs') this.otherFileError = msg;
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      // allow .jpg/.jpeg/.png and .pdf
      const msg = 'Invalid file type. Allowed: PDF, JPG, PNG.';
      if (field === 'passportCopy') this.passportFileError = msg;
      if (field === 'visaCopy') this.visaFileError = msg;
      if (field === 'otherDocs') this.otherFileError = msg;
      return;
    }

    if (field === 'passportCopy') this.passportFile = file;
    if (field === 'visaCopy') this.visaFile = file;
    if (field === 'otherDocs') this.otherFile = file;
  }

  // Validate complex rules that template-driven can't easily handle
  private validateBeforeSubmit(): { valid: boolean; message?: string } {
    // Required files
    // if (!this.passportFile && !this.isEditMode) {
    //   return { valid: false, message: 'Passport copy is required.' };
    // }
    // if (!this.visaFile && !this.isEditMode) {
    //   return { valid: false, message: 'Visa / Work Permit copy is required.' };
    // }

    // Date logic
    const todayDate = new Date(this.today + 'T00:00:00');
    if (this.formModel.dateOfBirth) {
      const dob = new Date(this.formModel.dateOfBirth);
      if (dob > new Date()) return { valid: false, message: 'Date of birth cannot be a future date.' };
    }

    if (this.formModel.passportExpiryDate) {
      const pExpiry = new Date(this.formModel.passportExpiryDate);
      if (pExpiry <= todayDate) return { valid: false, message: 'Passport expiry must be a future date.' };
    }

    if (this.formModel.visaIssueDate && this.formModel.visaExpiryDate) {
      const vIssue = new Date(this.formModel.visaIssueDate);
      const vExpiry = new Date(this.formModel.visaExpiryDate);
      if (vIssue > vExpiry) return { valid: false, message: 'Visa issue date cannot be later than visa expiry date.' };
    }

    // Employer contact: allow either valid email or phone (basic checks)
    if (this.formModel.employerContact) {
      const val = this.formModel.employerContact.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!emailRegex.test(val) && !phoneRegex.test(val)) {
        return { valid: false, message: 'Employer contact must be a valid email or phone number.' };
      }
    }

    // Passport pattern (uppercase letters + digits) already enforced during typing,
    // but final check to be safe:
    if (this.formModel.passportNumber) {
      const pRegex = /^[A-Z0-9]{1,20}$/;
      if (!pRegex.test(this.formModel.passportNumber)) return { valid: false, message: 'Passport number must contain only uppercase letters and digits.' };
    }

    return { valid: true };
  }

  saveImmigration(form: NgForm): void {
    console.log("🔥 saveImmigration() CALLED");
    console.log("Form Data:", form.value);
    console.log("Model:", this.formModel);

    // Prevent double submit
    if (this.isSubmitting) return;

    // check template-driven form validity
    if (form.invalid) {
      
      Swal.fire('Error', 'Please fix the form errors before submitting.', 'error');
      return;
    }

    // check our extra validations
    const check = this.validateBeforeSubmit();
    if (!check.valid) {
      Swal.fire('Validation error', check.message || 'Please check the form.', 'error');
      return;
    }

    // Prepare FormData
    const formData = new FormData();

    formData.append("ImmigrationId", this.formModel.immigrationId?.toString() || "0");

    // EmployeeId is required in DTO
    formData.append("EmployeeId", this.formModel.employeeId?.toString() ?? "0");

    formData.append("FullName", this.formModel.fullName ?? "");
    formData.append("DateOfBirth", this.formModel.dateOfBirth ?? "");
    formData.append("Nationality", this.formModel.nationality ?? "");
    formData.append("PassportNumber", this.formModel.passportNumber ?? "");
    formData.append("PassportExpiryDate", this.formModel.passportExpiryDate ?? "");
    formData.append("VisaTypeId", this.formModel.visaTypeId?.toString() ?? "0");
    formData.append("StatusId", this.formModel.statusId?.toString() ?? "0");

    formData.append("VisaNumber", this.formModel.visaNumber ?? "");
    formData.append("VisaIssueDate", this.formModel.visaIssueDate ?? "");
    formData.append("VisaExpiryDate", this.formModel.visaExpiryDate ?? "");
    formData.append("VisaIssuingCountry", this.formModel.visaIssuingCountry ?? "");

    formData.append("EmployerName", this.formModel.employerName ?? "");
    formData.append("EmployerAddress", this.formModel.employerAddress ?? "");
    formData.append("EmployerContact", this.formModel.employerContact ?? "");
    formData.append("ContactPerson", this.formModel.contactPerson ?? "");
    formData.append("Remarks", this.formModel.remarks ?? "");

    formData.append("CompanyId", this.companyId.toString());
    formData.append("RegionId", this.regionId.toString());
    formData.append("UserId", this.userId.toString());

    // Files (append only if present)
    if (this.passportFile) formData.append("passportCopy", this.passportFile);
    if (this.visaFile)     formData.append("visaCopy", this.visaFile);
    if (this.otherFile)    formData.append("otherDocs", this.otherFile);

    // Mark submitting
    this.isSubmitting = true;

    // UPDATE MODE
    if (this.isEditMode && this.formModel.immigrationId) {
      this.adminService
        .UpdateEmployeeImmigration(this.formModel.immigrationId, formData)
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Immigration record updated successfully!', 'success');
            this.resetForm(form);
            this.loadImmigrations();
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Update failed. Please try again.', 'error');
            this.isSubmitting = false;
          }
        });
    }
    // CREATE MODE
    else {
      this.adminService
        .CreateEmployeeImmigration(formData)
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Created successfully!', 'success');
            this.resetForm(form);
            this.loadImmigrations();
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error(err);
            // If backend returns field-level errors, show them
            if (err?.error && typeof err.error === 'object') {
              const messages = this.extractServerValidationMessages(err.error);
              Swal.fire('Validation error', messages.join('<br/>'), 'error');
            } else {
              Swal.fire('Error', 'Create failed. Please try again.', 'error');
            }
            this.isSubmitting = false;
          }
        });
    }
  }

  // Utility to extract backend validation messages (if present)
  private extractServerValidationMessages(errBody: any): string[] {
    const msgs: string[] = [];
    if (!errBody) return msgs;
    // If it's an object with field keys
    for (const k of Object.keys(errBody)) {
      const v = errBody[k];
      if (Array.isArray(v)) {
        v.forEach((m) => msgs.push(`${k}: ${m}`));
      } else if (typeof v === 'string') {
        msgs.push(`${k}: ${v}`);
      } else if (v && typeof v === 'object') {
        for (const k2 of Object.keys(v)) {
          msgs.push(`${k2}: ${v[k2]}`);
        }
      }
    }
    return msgs.length ? msgs : ['Unknown validation error'];
  }

  editImmigration(item: EmployeeImmigration): void {
    this.formModel = { ...item };
    this.isEditMode = true;

    // If the existing record already has file paths, we do not mark passportFile/visaFile as present; user may re-upload.
    // Clear file error messages when editing
    this.passportFileError = null;
    this.visaFileError = null;
    this.otherFileError = null;
  }

  confirmDelete(id?: number): void {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this immigration record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then((res) => {
      if (res.isConfirmed) {
        this.deleteImmigration(id);
      }
    });
  }

  deleteImmigration(id: number): void {
    this.adminService.DeleteEmployeeImmigration(id, this.companyId, this.regionId).subscribe({
      next: () => {
        Swal.fire('Deleted', 'Record deleted successfully!', 'success');
        this.loadImmigrations();
      },
      error: (err) => {
        console.error('Delete failed', err);
        Swal.fire('Error', 'Delete failed. Please try again.', 'error');
      }
    });
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.formModel = {} as EmployeeImmigration;
    this.isEditMode = false;
    this.passportFile = null;
    this.visaFile = null;
    this.otherFile = null;
    this.passportFileError = null;
    this.visaFileError = null;
    this.otherFileError = null;
    this.isSubmitting = false;
  }

  // Download via AdminService (expects server to return URL or file blob depending on implementation)
  downloadFile(id: number, fileType: string): void {
    this.adminService.DownloadImmigrationFile(id, fileType).subscribe({
      next: (response: any) => {
        // If backend provides a signed URL or filePath
        if (response && response.filePath) {
          const fullPath = this.adminService.getFileBaseUrl
            ? `${this.adminService.getFileBaseUrl()}${response.filePath}`
            : `${window.location.origin}/${response.filePath}`;
          window.open(fullPath, '_blank');
          return;
        }

        // If backend returns blob content
        if (response instanceof Blob) {
          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileType}_${id}`;
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        }

        // If backend returns direct URL
        if (typeof response === 'string') {
          window.open(response, '_blank');
          return;
        }

        Swal.fire('Error', 'File not found or invalid server response.', 'error');
      },
      error: (err) => {
        console.error("Download error:", err);
        Swal.fire('Error', 'File not available.', 'error');
      }
    });
  }

  // View document helper (open path)
  viewDocument(filePath: string | undefined): void {
    if (!filePath) {
      Swal.fire('Error', 'No file path available.', 'error');
      return;
    }

    const fullPath = `${window.location.origin}/${filePath}`;
    window.open(fullPath, '_blank');
  }

  // Utility: check if expiry within <= 30 days (or invalid date)
  isExpiringSoon(dateString: string | Date | undefined | null): boolean {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    if (isNaN(expiry.getTime())) return false;
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  // Add this method to your component class
private markFormGroupTouched(form: NgForm) {
  Object.keys(form.controls).forEach(key => {
    const control = form.controls[key];
    control.markAsTouched();
  });
}
}
