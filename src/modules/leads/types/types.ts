export type filterType = {
  source?: string;
  isLead: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
};

export type getLeadsQueryType = {
  page?: number;
  limit?: number;
  source?: string;
  startDate?: string;
  endDate?: string;
};

export type StatsResult = {
  totalLeads: Array<{ count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
  avgBudget: Array<{ avg: number }>;
  lastSevenDays: Array<{ count: number }>;
};
