import { Component } from '@angular/core';
import { TimesheetConfig } from '../../../layout/models/timesheet-configuration.model';
@Component({
  selector: 'app-timesheet-configuration',
  standalone: false,
  templateUrl: './timesheet-configuration.component.html',
  styleUrl: './timesheet-configuration.component.css'
})
export class TimesheetConfigurationComponent {
 timesheet: TimesheetConfig = this.defaultTimesheet();
  timesheetList: TimesheetConfig[] = [];
  searchText = '';
  isEditMode = false;
  editIndex = -1;

  frequencies = ['Daily', 'Weekly', 'Monthly'];
  roundingPolicies = ['No Rounding', 'Round Up', 'Round Down', 'Round Nearest'];

  ngOnInit(): void {}

  defaultTimesheet(): TimesheetConfig {
    return {
      Frequency: '',
      ApprovalRequired: false,
      LockAfterSubmit: false,
      OvertimeAllowed: false,
      RoundingPolicy: '',
      OptionalFields: '',
      Description: ''
    };
  }

  onSubmit() {
    if (this.isEditMode) {
      this.timesheetList[this.editIndex] = { ...this.timesheet };
      this.isEditMode = false;
      this.editIndex = -1;
    } else {
      this.timesheetList.push({ ...this.timesheet });
    }
    this.resetForm();
  }

  editTimesheet(item: TimesheetConfig) {
    this.timesheet = { ...item };
    this.isEditMode = true;
    this.editIndex = this.timesheetList.indexOf(item);
  }

  deleteTimesheet(index: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.timesheetList.splice(index, 1);
    }
  }

  filteredTimesheets() {
    if (!this.searchText) return this.timesheetList;
    return this.timesheetList.filter(t => t.Frequency.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  resetForm() {
    this.timesheet = this.defaultTimesheet();
    this.isEditMode = false;
  }
}
