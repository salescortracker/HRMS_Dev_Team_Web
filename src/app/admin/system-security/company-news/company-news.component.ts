import { Component } from '@angular/core';
interface News {
  Title: string;
  Category: string;
  Description: string;
  Date: Date;
  Attachment?: File | null;
}
@Component({
  selector: 'app-company-news',
  standalone: false,
  templateUrl: './company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent {
 newsList: News[] = [];
  news: News = this.resetNews();
  isEditMode: boolean = false;
  editIndex: number | null = null;

  // Filters
  searchText: string = '';
  searchCategory: string = '';
  startDate: string = '';
  endDate: string = '';

  categories: string[] = ['HR', 'IT', 'Finance', 'General', 'Announcement'];

  resetNews(): News {
    return {
      Title: '',
      Category: '',
      Description: '',
      Date: new Date(),
      Attachment: null
    };
  }

  onSubmit() {
    if (this.isEditMode && this.editIndex !== null) {
      this.newsList[this.editIndex] = { ...this.news, Date: new Date() };
    } else {
      this.newsList.push({ ...this.news, Date: new Date() });
    }
    this.resetForm();
  }

  editNews(n: News) {
    this.isEditMode = true;
    this.editIndex = this.newsList.indexOf(n);
    this.news = { ...n };
  }

  deleteNews(n: News) {
    const index = this.newsList.indexOf(n);
    if (index > -1) this.newsList.splice(index, 1);
  }

  resetForm() {
    this.news = this.resetNews();
    this.isEditMode = false;
    this.editIndex = null;
  }

  filteredNews(): News[] {
    return this.newsList.filter(n => {
      const matchesText = n.Title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCategory = this.searchCategory ? n.Category === this.searchCategory : true;
      const matchesStart = this.startDate ? new Date(n.Date) >= new Date(this.startDate) : true;
      const matchesEnd = this.endDate ? new Date(n.Date) <= new Date(this.endDate) : true;
      return matchesText && matchesCategory && matchesStart && matchesEnd;
    });
  }
}
