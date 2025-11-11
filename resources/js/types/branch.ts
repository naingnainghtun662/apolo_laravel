export type Branch = {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    currency: string;
    tax: number;
    lat: number;
    long: number;
    radius: number;
    introType: string;
    coverImage: string;
    logoImage: string;
    tenantId: number;
    languages: Language[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Language = {
    id: number;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
};
