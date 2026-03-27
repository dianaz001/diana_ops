export interface RentalListing {
  id: string;
  link: string;
  address: string;
  location: string;
  type: string;
  yearBuilt: string;
  sqft: string;
  listedPrice: string;
  waterIncluded: boolean;
  hydroIncluded: boolean;
  inSuiteLaundry: boolean;
  promotions: string;
  finalPrice: number;
  priceWithUtilities: number;
  withRealtor: boolean;
  manager: string;
  gym: boolean;
  amenities: string;
  otherAspects: string;
  onlineRating: number;
  reviewed: boolean;
  visitScheduled: string;
  visitRating: number | null;
  visitComments: string;
  makeOffer: string;
  rank: number;
  rejected: boolean;
  imageUrl?: string;
}

export type RentalViewMode = 'cards' | 'table';

export type RentalSortField = 'rank' | 'finalPrice' | 'priceWithUtilities' | 'onlineRating' | 'sqft';
