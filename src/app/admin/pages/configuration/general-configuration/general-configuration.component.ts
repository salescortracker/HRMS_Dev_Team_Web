import { Component } from '@angular/core';
import { GeneralConfiguration } from '../../../layout/models/general-configuration.model';
@Component({
  selector: 'app-general-configuration',
  standalone: false,
  templateUrl: './general-configuration.component.html',
  styleUrl: './general-configuration.component.css'
})
export class GeneralConfigurationComponent {
config: GeneralConfiguration = this.defaultConfig();
  configurations: GeneralConfiguration[] = [];
  searchText = '';
  isEditMode = false;
  editIndex = -1;

  countries: string[] = ['India', 'United States', 'United Kingdom', 'Australia', 'Canada'];
  timeZones: string[] = ['IST (UTC+05:30)', 'UTC', 'EST (UTC−05:00)', 'CST (UTC−06:00)', 'PST (UTC−08:00)'];
  currencies: string[] = ['INR', 'USD', 'GBP', 'EUR', 'AUD'];
  dateFormats: string[] = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'];

  ngOnInit(): void {}

  defaultConfig(): GeneralConfiguration {
    return {
      CompanyName: '',
      CompanyCode: '',
      Country: '',
      TimeZone: '',
      Currency: '',
      DateFormat: 'DD-MM-YYYY',
      FYStart: '',
      FYEnd: '',
      AutoLogout: 15,
      EnableDarkMode: false
    };
  }

  onSubmit() {
    if (this.isEditMode) {
      this.configurations[this.editIndex] = { ...this.config };
      this.isEditMode = false;
      this.editIndex = -1;
    } else {
      this.configurations.push({ ...this.config });
    }
    this.resetForm();
  }

  editConfig(item: GeneralConfiguration) {
    this.config = { ...item };
    this.isEditMode = true;
    this.editIndex = this.configurations.indexOf(item);
  }

  deleteConfig(index: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.configurations.splice(index, 1);
    }
  }

  filteredConfigs() {
    if (!this.searchText) return this.configurations;
    return this.configurations.filter(
      c =>
        c.CompanyName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.Country.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  resetForm() {
    this.config = this.defaultConfig();
    this.isEditMode = false;
  }
}
