
export interface Language {
    id: string;
    name: string;
    code: string;

}


export type LanguageListResponse = Language[];

export type DeleteManyResponse = {
    count: number;
};

export interface LanguageDetailResponse {
    data: Language;
}

export interface LanguageCreatePayload {
    name: string;
    code: string;
}

export interface LanguageUpdatePayload {
    name?: string;
    code?: string;
}

export type LanguageCreateManyPayload = LanguageCreatePayload[];