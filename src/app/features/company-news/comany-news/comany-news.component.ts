import { Component } from '@angular/core';
interface NewsItem {
  Title: string;
  Category: string;
  Description: string;
  Date: Date;
}
@Component({
  selector: 'app-comany-news',
  standalone: false,
  templateUrl: './comany-news.component.html',
  styleUrl: './comany-news.component.css'
})
export class ComanyNewsComponent {
 // Array to store all news
  newsList: NewsItem[] = [
    {
      Title: '🎉 Annual Employee Awards 2025 Announced!',
      Category: 'Achievements',
      Description: 'Congratulations to all award winners for their exceptional contributions. The award ceremony photos and certificates will be shared by HR.',
      Date: new Date('2025-10-15')
    },
    {
      Title: '📢 Office Renovation Schedule – Phase 2',
      Category: 'Announcements',
      Description: 'The next phase of our office renovation will begin on 20th October. Some workstations will be temporarily shifted to the west wing. Please cooperate during this time.',
      Date: new Date('2025-10-10')
    },
    {
      Title: '📢 Office Renovation Schedule – Phase 2',
      Category: 'Announcements',
      Description: 'The next phase of our office renovation will begin on 20th October. Some workstations will be temporarily shifted to the west wing. Please cooperate during this time.',
      Date: new Date('2025-10-10')
    }
  ];

  // Current news model for add/edit
  news: NewsItem = this.resetNews();
  isEditMode: boolean = false;
  editIndex: number | null = null;

  // Filter fields
  searchCategory: string = '';
  searchDate: string = '';

  categories: string[] = ['Announcements', 'HR Policy', 'Events', 'Achievements', 'General Updates'];

  // Reset form model
  resetNews(): NewsItem {
    return {
      Title: '',
      Category: '',
      Description: '',
      Date: new Date()
    };
  }

  // Add or update news
  onSubmit() {
    if (this.isEditMode && this.editIndex !== null) {
      this.newsList[this.editIndex] = { ...this.news };
    } else {
      this.newsList.push({ ...this.news });
    }
    this.resetForm();
  }

  // Edit existing news
  editNews(n: NewsItem) {
    this.isEditMode = true;
    this.editIndex = this.newsList.indexOf(n);
    this.news = { ...n };
  }

  // Delete news
  deleteNews(n: NewsItem) {
    const index = this.newsList.indexOf(n);
    if (index > -1) this.newsList.splice(index, 1);
  }

  // Reset form
  resetForm() {
    this.news = this.resetNews();
    this.isEditMode = false;
    this.editIndex = null;
  }

  // Filter news by category and date
  filteredNews(): NewsItem[] {
    return this.newsList.filter(n => {
      const matchesCategory = this.searchCategory ? n.Category === this.searchCategory : true;
      const matchesDate = this.searchDate ? new Date(n.Date).toDateString() === new Date(this.searchDate).toDateString() : true;
      return matchesCategory && matchesDate;
    });
  }
}
