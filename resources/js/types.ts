export type Project = {
    slug: string;
    title: string;
};

/** Аукцион: только суммы и сроки, без имён и контактов участников. */
export type Auction = {
    start_rub: number;
    step_rub: number;
    current_rub: number | null;
    bids_count: number;
    min_bid_rub: number;
    ends_at: string | null;
    open: boolean;
};

// Публичные поля вещи. Контактов покупателей и участников аукциона здесь нет и быть не должно.
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
    reserved: boolean;
    draft: boolean;
    available: boolean;
    sale_mode: 'fixed' | 'auction';
    auction: Auction | null;
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
    flash: { bid_placed: boolean };
};

export type BlockId = 'veshi' | 'istoriya' | 'fond';
