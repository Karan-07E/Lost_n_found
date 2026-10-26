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
  'A Block',
  'B Block',
  'C Block',
  'D Block',
  'H Block',
  'G Block',
  'M Block',
  'MBA Block',
  'New Food Court',
  'Old Food Court',
  'Basketball Ground',
  'CCD',
  'Sahukar Chennaiyya Auditorium',
  'Sports Complex',
  'Boys Hostel',
  'Girls Hostel',
  'Security (Gate 1)',
  'Security (Gate 2)',
  'K P Convent School',
  'M block Opposite Parking Area',
  'MBA Block Parking Area',
  'D Block Parking Area',
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
