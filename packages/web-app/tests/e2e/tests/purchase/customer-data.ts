/**
 * Test data for customer information tests
 */
export interface CustomerData {
  memberCode: string;
  memberId: string;
  memberName: string;
  memberFurigana: string;
  memberPoints: string;
}

/**
 * Sample customer data for testing
 */
export const testCustomers: Record<string, CustomerData> = {
  // Customer with member code 123491
  customer1: {
    memberCode: '123491',
    memberId: '53',
    memberName: '齊田純輝',
    memberFurigana: 'サイダジュンキ',
    memberPoints: '0pt',
  },
  // Add more test customers as needed
};
