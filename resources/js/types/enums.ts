export interface CarColorOption {
    id: string;
    name: string;
    hex: string;
    needsBorder: boolean;
}

export interface EntryTypeOption {
    id: string;
    label: string;
    icon: string;
}

export interface CurrencyOption {
    id: string;
    symbol: string;
    label: string;
}

export interface TransferStatusOption {
    id: string;
}

export interface SharedEnums {
    carColors: CarColorOption[];
    entryTypes: EntryTypeOption[];
    currencies: CurrencyOption[];
    transferStatuses: TransferStatusOption[];
}

