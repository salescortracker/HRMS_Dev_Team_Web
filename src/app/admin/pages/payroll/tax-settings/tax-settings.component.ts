import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService,TaxSetting,TaxType } from '../../../servies/admin.service';
@Component({
  selector: 'app-tax-settings',
  templateUrl: './tax-settings.component.html',
  styleUrls: ['./tax-settings.component.css'],
  standalone : false
})
export class TaxSettingsComponent implements OnInit {

  taxForm!: FormGroup;
  taxSettings: TaxSetting[] = [];
  taxTypes: TaxType[] = [];

  editingTaxId: number | null = null;
  searchText = '';
  currentPage = 1;
  pageSize = 5;

  // 🔹 SORTING
  sortColumn: keyof TaxSetting | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTaxTypes();
    this.loadTaxSettings();
  }

  initForm() {
    this.taxForm = this.fb.group({
      TaxName: ['', Validators.required],
      TaxTypeId: ['', Validators.required],
      Rate: [0, [Validators.required, Validators.min(0)]],
      EffectiveDate: [''],
      IsActive: [true]
    });
  }

  loadTaxTypes() {
    this.adminService.getTaxTypes().subscribe(res => {
      this.taxTypes = res;
    });
  }

  loadTaxSettings() {
    this.adminService.getAllTaxSettings().subscribe((res: any[]) => {
      this.taxSettings = res.map(x => ({
        TaxId: x.taxId,
        TaxName: x.taxName,
        TaxTypeId: x.taxTypeId,
        Rate: x.rate,
        EffectiveDate: new Date(x.effectiveDate),
        IsActive: x.isActive
      }));
    });
  }

  saveTax() {
    if (this.taxForm.invalid) return;

    const raw = this.taxForm.value;

    const model: TaxSetting = {
      ...raw,
      EffectiveDate: raw.EffectiveDate ? new Date(raw.EffectiveDate) : null
    };

    if (this.editingTaxId) {
      this.adminService.updateTaxSetting(this.editingTaxId, model).subscribe(() => {
        Swal.fire('Updated', 'Tax updated successfully', 'success');
        this.resetForm();
        this.loadTaxSettings();
      });
    } else {
      this.adminService.createTaxSetting(model).subscribe(() => {
        Swal.fire('Saved', 'Tax created successfully', 'success');
        this.resetForm();
        this.loadTaxSettings();
      });
    }
  }

  editTax(t: TaxSetting) {
    this.editingTaxId = t.TaxId!;
    this.taxForm.patchValue({
      ...t,
      EffectiveDate: t.EffectiveDate
        ? new Date(t.EffectiveDate).toISOString().substring(0, 10)
        : ''
    });
  }

  deleteTax(t: TaxSetting) {
    Swal.fire({
      title: 'Delete?',
      text: `Delete ${t.TaxName}?`,
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.adminService.deleteTaxSetting(t.TaxId!)
          .subscribe(() => {
            Swal.fire('Deleted', 'Removed successfully', 'success');
            this.loadTaxSettings();
          });
      }
    });
  }

  resetForm() {
    this.editingTaxId = null;
    this.taxForm.reset({ IsActive: true });
  }

  // 🔹 SORT HANDLER
  sort(column: keyof TaxSetting) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // 🔍 SEARCH + ↕ SORT
  filteredTaxes() {
    let data = [...this.taxSettings];

    if (this.searchText) {
      data = data.filter(t =>
        t.TaxName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        return 0;
      });
    }

    return data;
  }

  // 📄 PAGINATION
  paginatedTaxes() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTaxes().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredTaxes().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage = p;
  }

  getTaxTypeName(id: number) {
    return this.taxTypes.find(x => x.taxTypeId === id)?.taxTypeName || '';
  }
}