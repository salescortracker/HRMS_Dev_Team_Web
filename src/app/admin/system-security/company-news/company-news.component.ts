import { Component } from '@angular/core';
import { AdminService, CompanyNewsDto, RoleMaster } from '../../servies/admin.service';
/* ✅ FIX 1 */
interface NewsForm {
  Title: string;
  Category: string;
  Description: string;
  FromDate: string;
  ToDate: string;
}


@Component({
  selector: 'app-company-news',
  standalone: false,
  templateUrl: './company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent {
   newsList: CompanyNewsDto[] = [];
  categories: RoleMaster[] = [];

  news: NewsForm = this.resetNews();

  isEditMode = false;
  editNewsId: number | null = null;

  selectedFile: File | null = null;
  existingFileName = '';
// Sorting
sortColumn: 'title' | 'category' | 'fromDate' | 'toDate' | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];

  searchText = '';
  searchCategory = '';
  startDate = '';
  endDate = '';

  companyId = Number(localStorage.getItem('companyId'));
  regionId  = Number(localStorage.getItem('regionId'));
  userId    = Number(localStorage.getItem('userId'));

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadCompanyNews();
  }

  loadCategories() {
    this.adminService.getroles().subscribe(res => {
      this.categories = res.filter(x => x.isActive);
    });
  }

  loadCompanyNews() {
    this.adminService.getCompanyNews(this.companyId, this.regionId)
      .subscribe(res => this.newsList = res);
  }

  onFileSelected(event: any) {
    if (event.target.files?.length) {
      this.selectedFile = event.target.files[0];
    }
  }

  resetNews(): NewsForm {
    return {
      Title: '',
      Category: '',
      Description: '',
      FromDate: '',
      ToDate: ''
    };
  }

  onSubmit() {
    const formData = new FormData();

    if (this.isEditMode && this.editNewsId) {
      formData.append('NewsId', this.editNewsId.toString());
    }

    formData.append('Title', this.news.Title);
    formData.append('Category', this.news.Category);
    formData.append('Description', this.news.Description || '');
    formData.append('FromDate', this.news.FromDate);
    formData.append('ToDate', this.news.ToDate);
    formData.append('RegionId', this.regionId.toString());

    if (this.selectedFile) {
      formData.append('UploadFile', this.selectedFile);
    }

    const request$ = this.isEditMode
      ? this.adminService.updateCompanyNewsForm(this.editNewsId!, formData)
      : this.adminService.createCompanyNewsForm(formData);

    request$.subscribe(() => {
      this.resetForm();
      this.loadCompanyNews();
    });
  }

  editNews(n: CompanyNewsDto) {
    this.isEditMode = true;
    this.editNewsId = n.newsId!;
    this.existingFileName = n.attachmentName || '';

    this.news = {
      Title: n.title,
      Category: n.category,
      Description: n.description,
      FromDate: n.fromDate.substring(0, 10),
      ToDate: n.toDate.substring(0, 10)
    };

    this.selectedFile = null;
  }

  deleteNews(n: CompanyNewsDto) {
    if (!confirm('Delete this news?')) return;

    this.adminService.deleteCompanyNews(n.newsId!)
      .subscribe(() => this.loadCompanyNews());
  }

  resetForm() {
    this.news = this.resetNews();
    this.isEditMode = false;
    this.editNewsId = null;
    this.selectedFile = null;
    this.existingFileName = '';
  }

 filteredNews(): CompanyNewsDto[] {
  let data = this.getSortedNews().filter(n => {
    const text = n.title.toLowerCase().includes(this.searchText.toLowerCase());
    const cat  = this.searchCategory ? n.category === this.searchCategory : true;
    const from = this.startDate ? new Date(n.fromDate) >= new Date(this.startDate) : true;
    const to   = this.endDate ? new Date(n.toDate) <= new Date(this.endDate) : true;
    return text && cat && from && to;
  });

  const startIndex = (this.currentPage - 1) * this.pageSize;
  return data.slice(startIndex, startIndex + this.pageSize);
}

  sortBy(column: 'title' | 'category' | 'fromDate' | 'toDate') {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

getSortedNews(): CompanyNewsDto[] {
  let data = [...this.newsList];

  if (this.sortColumn) {
    data.sort((a: any, b: any) => {
      const valA = a[this.sortColumn!];
      const valB = b[this.sortColumn!];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return data;
}
get totalPages(): number {
  return Math.ceil(
    this.getSortedNews().filter(n => {
      const text = n.title.toLowerCase().includes(this.searchText.toLowerCase());
      const cat  = this.searchCategory ? n.category === this.searchCategory : true;
      const from = this.startDate ? new Date(n.fromDate) >= new Date(this.startDate) : true;
      const to   = this.endDate ? new Date(n.toDate) <= new Date(this.endDate) : true;
      return text && cat && from && to;
    }).length / this.pageSize
  );
}

changePage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

changePageSize(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
}

}