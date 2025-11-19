import { Component } from '@angular/core';
import { MobileAppConfig } from '../../../layout/models/mobileapp-config.model';
@Component({
  selector: 'app-mobile-app-configuration',
  standalone: false,
  templateUrl: './mobile-app-configuration.component.html',
  styleUrl: './mobile-app-configuration.component.css'
})
export class MobileAppConfigurationComponent {
 config: MobileAppConfig = this.defaultConfig();
  configList: MobileAppConfig[] = [];
  searchText = '';
  isEditMode = false;
  editIndex = -1;

  syncFrequencies = ['Real-time', 'Hourly', 'Daily', 'Weekly'];

  ngOnInit(): void {}

  defaultConfig(): MobileAppConfig {
    return {
      MobileAccessEnabled: false,
      PushNotifications: false,
      OTPLogin: false,
      BiometricLogin: false,
      SyncFrequency: '',
      MinAppVersion: '',
      Description: ''
    };
  }

  onSubmit() {
    if (this.isEditMode) {
      this.configList[this.editIndex] = { ...this.config };
      this.isEditMode = false;
      this.editIndex = -1;
    } else {
      this.configList.push({ ...this.config });
    }
    this.resetForm();
  }

  editConfig(c: MobileAppConfig) {
    this.config = { ...c };
    this.isEditMode = true;
    this.editIndex = this.configList.indexOf(c);
  }

  deleteConfig(index: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.configList.splice(index, 1);
    }
  }

  filteredConfigs() {
    if (!this.searchText) return this.configList;
    return this.configList.filter(c => 
      (c.SyncFrequency?.toLowerCase().includes(this.searchText.toLowerCase()) ||
       c.MinAppVersion?.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  resetForm() {
    this.config = this.defaultConfig();
    this.isEditMode = false;
  }
}
