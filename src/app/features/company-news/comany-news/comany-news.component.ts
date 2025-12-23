import { Component } from '@angular/core';
import { CompanyNewsService } from '../services/company-news.service';
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
  newsList: NewsItem[] = [];

  constructor(private newsService: CompanyNewsService) {}

  ngOnInit(): void {
    this.loadCompanyNews();
  }

  /* 🔹 Load news for logged-in user */
 loadCompanyNews(): void {
    // ✅ READ FROM sessionStorage (matches login)
    const roleName = sessionStorage.getItem('roleName');

    if (!roleName) {
      console.error('Role name not found in sessionStorage');
      return;
    }

    this.newsService.getCompanyNewsByCategory(roleName).subscribe({
      next: (res) => {
        this.newsList = res.map(n => ({
          Title: n.title,
          Category: n.category,
          Description: n.description,
          Date: new Date(n.displayDate)
        }));
      },
      error: (err) => {
        console.error('Error loading company news', err);
      }
    });
  }
}
