import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/login/login/login.component';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { HeaderComponent } from './features/header/header.component';
import { SidebarComponent } from './features/sidebar/sidebar.component';
import { FooterComponent } from './features/footer/footer.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/employee-profile/profile/profile.component';
import { DigitalBusinessCardComponent } from './features/employee-profile/digital-business-card/digital-business-card.component';
import { EmployeeDetailsComponent } from './features/employee-profile/employee-details/employee-details.component';
import { EmployeePersonalDetailsComponent } from './features/employee-profile/employee-details/employee-personal-details/employee-personal-details.component';
import { EmployeeFamilyDetailsComponent } from './features/employee-profile/employee-details/employee-family-details/employee-family-details.component';
import { EmployeeEmergencyContactComponent } from './features/employee-profile/employee-emergency-contact/employee-emergency-contact.component';
import { EmployeeReferencesComponent } from './features/employee-profile/employee-references/employee-references.component';
import { FormsModule } from '@angular/forms';
import { ManagerDashboardComponent } from './features/auth/manager-dashboard/manager-dashboard.component';
import { FinanceDashboardComponent } from './features/auth/finance-dashboard/finance-dashboard.component';
import { EmployeeDashboardComponent } from './features/auth/employee-dashboard/employee-dashboard.component';
import { NavbarHrComponent } from './hr/layout/navbar-hr/navbar-hr.component';
import { NavbarHrLayoutComponent } from './hr/layout/navbar-hr-layout/navbar-hr-layout.component';
import { NavbarManagerComponent } from './manager/layout/navbar-manager/navbar-manager.component';
import { NavbarManagerLayoutComponent } from './manager/layout/navbar-manager-layout/navbar-manager-layout.component';
import { NavbarEmployeeComponent } from './employee/layout/navbar-employee/navbar-employee.component';
import { NavbarEmployeeLayoutComponent } from './employee/layout/navbar-employee-layout/navbar-employee-layout.component';
import { NavbarFinanceComponent } from './finance/layout/navbar-finance/navbar-finance.component';
import { NavbarFinanceLayoutComponent } from './finance/layout/navbar-finance-layout/navbar-finance-layout.component';
import { NavbarHeaderEmployeeComponent } from './employee/layout/navbar-header-employee/navbar-header-employee.component';
import { NavbarFooterEmployeeComponent } from './employee/layout/navbar-footer-employee/navbar-footer-employee.component';
import { EmployeeSkillsComponent } from './features/employee-profile/employee-skills/employee-skills.component';
import { EmployeeDocumentsComponent } from './features/employee-profile/employee-documents/employee-documents.component';
import { EmployeeFinanceComponent } from './features/employee-profile/employee-finance/employee-finance.component';
import { EmployeeResignationComponent } from './features/employee-profile/employee-resignation/employee-resignation.component';
import { EmployeeImmigrationComponent } from './features/employee-profile/employee-immigration/employee-immigration.component';
import { ClockinClockoutComponent } from './features/attendance/clockin-clockout/clockin-clockout.component';
import { ShiftAllocationComponent } from './features/attendance/shift-allocation/shift-allocation.component';
import { DailyWorkingHoursComponent } from './features/attendance/daily-working-hours/daily-working-hours.component';
import { LateArrivalsComponent } from './features/attendance/late-arrivals/late-arrivals.component';
import { EarlyDeparturesComponent } from './features/attendance/early-departures/early-departures.component';
import { WfoRemoteRequestComponent } from './features/attendance/wfo-remote-request/wfo-remote-request.component';
import { MissedPunchRequestComponent } from './features/attendance/missed-punch-request/missed-punch-request.component';
import { LeaveManagementComponent } from './features/leave/leave-management/leave-management.component';
import { ExpenseManagementComponent } from './features/expenses/expense-management/expense-management.component';
import { AssetManagementComponent } from './features/asset/asset-management/asset-management.component';
import { TimesheetManagementComponent } from './features/timesheet/timesheet-management/timesheet-management.component';
import { KpiPerformanceComponent } from './features/performance/kpi-performance/kpi-performance.component';
import { HelpDeskManagementComponent } from './features/helpdesk/help-desk-management/help-desk-management.component';
import { ComanyNewsComponent } from './features/company-news/comany-news/comany-news.component';
import { EmployeePolicyComponent } from './features/company-policies/employee-policy/employee-policy.component';
import { MyTeamHierarchyComponent } from './features/my-team/my-team-hierarchy/my-team-hierarchy.component';
import { MyCalendarComponent } from './features/my-calendar/my-calendar/my-calendar.component';
import { MyEventsComponent } from './features/events/my-events/my-events.component';
import { CompensationComponent } from './features/compensation/compensation/compensation.component';
import { RecruitmentProcessComponent } from './features/recruitment/recruitment-process/recruitment-process.component'; 
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonUploadComponent } from './shared/common-upload/common-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeLettersComponent } from './features/employee-profile/employee-letters/employee-letters.component';
import { EmployeeFormsComponent } from './features/employee-profile/employee-forms/employee-forms.component';
import { EmployeeDocumentComponent } from './features/employee-profile/employee-document/employee-document.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent,
    ProfileComponent,
    DigitalBusinessCardComponent,
    EmployeeDetailsComponent,
    EmployeePersonalDetailsComponent,
    EmployeeFamilyDetailsComponent,
    EmployeeEmergencyContactComponent,
    EmployeeReferencesComponent,
    ManagerDashboardComponent,
    FinanceDashboardComponent,
    EmployeeDashboardComponent,
    NavbarHrComponent,
    NavbarHrLayoutComponent,
    NavbarManagerComponent,
    NavbarManagerLayoutComponent,
    NavbarEmployeeComponent,
    NavbarEmployeeLayoutComponent,
    NavbarFinanceComponent,
    NavbarFinanceLayoutComponent,
    NavbarHeaderEmployeeComponent,
    NavbarFooterEmployeeComponent,
    EmployeeSkillsComponent,
    EmployeeDocumentsComponent,
    EmployeeFinanceComponent,
    EmployeeResignationComponent,
    EmployeeImmigrationComponent,
    ClockinClockoutComponent,
    ShiftAllocationComponent,
    DailyWorkingHoursComponent,
    LateArrivalsComponent,
    EarlyDeparturesComponent,
    WfoRemoteRequestComponent,
    MissedPunchRequestComponent,
    LeaveManagementComponent,
    ExpenseManagementComponent,
    AssetManagementComponent,
    TimesheetManagementComponent,
    KpiPerformanceComponent,
    HelpDeskManagementComponent,
    ComanyNewsComponent,
    EmployeePolicyComponent,
    MyTeamHierarchyComponent,
    MyCalendarComponent,
    MyEventsComponent,
    CompensationComponent,
    RecruitmentProcessComponent,
    CommonUploadComponent,
    EmployeeLettersComponent,
    EmployeeFormsComponent,
    EmployeeDocumentComponent
  ],
  imports: [
    BrowserModule,ReactiveFormsModule,
    AppRoutingModule,FormsModule ,HttpClientModule,NgxSpinnerModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
