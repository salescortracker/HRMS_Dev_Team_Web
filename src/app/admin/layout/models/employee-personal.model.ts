export interface EmployeePersonal {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // stored as ISO but displayed as DD/MM/YYYY
  gender: 'Male'|'Female'|'Other'| '';
  mobileNumber: string;
  personalEmail: string;
  permanentAddress: string;
  presentAddress: string;
  panNumber: string;
  aadhaarNumber: string;
  profilePictureBase64?: string; // small base64 thumbnail
  profilePictureName?: string;
  passportNumber?: string;
  placeOfBirth?: string;
  uan?: string;
  bloodGroup: string;
  citizenship?: string;
  religion?: string;
  drivingLicence?: string;
  maritalStatus: 'Single'|'Married'|'Divorced'|'Widowed'|'';
  marriageDate?: string;
  workPhone?: string;
  linkedInProfile?: string;
  previousExperienceText?: string;
  previousExperienceYears?: number | null;
  createdAt: string;
  modifiedAt?: string;
}
