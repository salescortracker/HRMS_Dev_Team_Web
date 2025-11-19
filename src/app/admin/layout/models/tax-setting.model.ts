export interface TaxSetting {
  Name: string;
  Type: string;
  Rate: number;
  EffectiveDate?: Date;
  IsActive: boolean;
}