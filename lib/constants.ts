export const ITEM_CATEGORIES = [
  'Mobile / Electronics',
  'ID Card',
  'Wallet',
  'Bag / Backpack',
  'Books / Notes',
  'Keys',
  'Accessories',
  'Documents',
  'Water Bottle',
  'Clothing',
  'Other',
] as const;

export const CAMPUS_LOCATIONS = [
  'Main Library',
  'Canteen / Food Court',
  'Main Block',
  'Computer Science Block',
  'Engineering Block',
  'Science Block',
  'Auditorium',
  'Sports Ground',
  'Hostel Block A',
  'Hostel Block B',
  'Admin Block',
  'Parking Area',
  'Bus Stop',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];

export const DEPARTMENTS = [
  'Computer Science (CSE)',
  'CSE-AIML',
  'Information Science (ISE)',
  'Electronics & Communication (ECE)',
  'Electrical Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'MBA',
  'MCA',
  'Other',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
