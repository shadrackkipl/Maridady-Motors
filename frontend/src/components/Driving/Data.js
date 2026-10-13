export const WHATSAPP = 'https://wa.me/message/REOQ2KB3FWBYF1'
export const MAIN_PHONE = '0709 888 777'

export const NTSA_FEE = 2050

export const CLASSES = [
  { id: 'boda', label: 'Boda boda operators', code: 'A2', minAge: 18, training: 3580 },
  { id: 'learner', label: 'Motorbike, beginners', code: 'A2', minAge: 18, training: 8500 },
  { id: 'saloon', label: 'Saloon car, manual or automatic', code: 'B1', minAge: 18, training: 18780 },
  { id: 'plw', label: 'Professional (PLW)', code: 'B3', minAge: 21, training: 12780 },
  { id: 'truck', label: 'Trucks and buses', code: 'C', minAge: 22, training: 21180 },
  { id: 'psv', label: 'PSV', code: 'D', minAge: 25, training: 12780 },
  { id: 'pwd', label: 'Special class (PWD)', code: 'F', minAge: 18, training: 18780 },
]

export const PACKAGES = [
  { name: 'Bronze', fee: 16500, lessons: 20, km: 5 },
  { name: 'Silver', fee: 26000, lessons: 20, km: 10 },
  { name: 'Gold', fee: 36000, lessons: 20, km: 15 },
]

export const BRANCHES = [
  { name: 'Ridgeways (head office)', place: 'Kiambu Road, Nairobi', phone: '0794 517 828' },
  { name: 'Ruaka and Karen', place: 'Ruaka and The Waterfront, Karen', phone: '0792 000 111' },
  { name: 'Nakuru', place: 'West Road, D&D House', phone: '0103 888 888' },
  { name: 'Thika', place: 'Thika town', phone: '0709 888 777' },
]

export const ksh = (n) => 'Ksh ' + n.toLocaleString('en-KE')