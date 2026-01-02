export interface CompanyPolicy {
  policyId?: number;
  companyId: number;
  regionId: number;
  title: string;
  categoryId: number;
  categoryName?: string;
  effectiveDate: string;   
  description?: string;
  fileName?: string;
  filePath?: string;
}
