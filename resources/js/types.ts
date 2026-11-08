export type Project = {
    slug: string;
    title: string;
};

// Публичные поля вещи. Базы и параметров формулы здесь нет и быть не должно.
export type Item = {
    slug: string;
    title: string;
    owner: { name: string | null; category: string | null; category_label: string | null };
    brand: string | null;
    size: string | null;
    project: Project | null;
    price_rub: number | null;
    fund_rub: number | null;
    sold: boolean;
    draft: boolean;
    available: boolean;
    photos: { url: string; thumb: string; full: string; alt: string }[];
};

export type ItemDetail = Item & {
    item_type: string | null;
    condition: string | null;
    measurements: string | null;
    scene: string | null;
    look: string | null;
    story: string | null;
    video_url: string | null;
};

export type Stats = {
    items_count: number;
    sold_count: number;
    fund_total_rub: number;
};

export type Site = {
    name: string;
    fund_name: string;
    domain: string;
    drop_label: string;
};

export type SharedProps = {
    site: Site;
};

export type BlockId = 'veshi' | 'istoriya' | 'fond';
