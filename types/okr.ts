


export type KeyResult = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: string;
};

export type Initiative = {
  id: string;
  title: string;
  status: string;
};

export type Objective = {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  keyResults: KeyResult[];
  initiatives: Initiative[];
};
