import { Component } from '@angular/core';

@Component({
  selector: 'app-offer',
  standalone: false,
  templateUrl: './offer.component.html',
  styleUrl: './offer.component.css'
})
export class OfferComponent {
  candidates: any[] = [
    {
      id: 1,
      name: 'John',
      
      stage: 4,
      offer: {}
    },
    {
      id: 2,
      name: 'Soma',
      stage: 4,
      offer: {}
    }
  ];

  // ===== OFFER FORM =====
  offerForm: any = {
    candidate: null,
    role: '',
    ctc: '',
    doj: '',
    status: 'Offered',
    hrName: '',
    file: null
  };

  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  globalFilter = '';
  filterStage: any = '';

  // ===== SAVE OFFER (STATIC POST) =====
  applyOffer() {
    if (!this.offerForm.candidate) {
      alert('Select candidate for offer');
      return;
    }

    const offerPayload = {
      role: this.offerForm.role,
      ctc: this.offerForm.ctc,
      doj: this.offerForm.doj,
      status: this.offerForm.status,
      hrName: this.offerForm.hrName,
      letter: this.offerForm.file,
      createdOn: this.todayTime()
    };

    // 🔹 STATIC POST (attach offer to candidate)
    this.offerForm.candidate.offer = offerPayload;

    // 🔹 Update stage
    this.offerForm.candidate.stage = 5;

    // 🔹 RESET FORM
    this.offerForm = {
      candidate: null,
      role: '',
      ctc: '',
      doj: '',
      status: 'Offered',
      hrName: '',
      file: null
    };

    alert('Offer saved successfully (static data)');
  }

  // ===== HELPERS =====
  calculateProgress(c: any) {
    return Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
  }

  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  viewCandidates() {
    return this.candidates;
  }
}
