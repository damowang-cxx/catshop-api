import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getStats(): {
        products: number;
        collections: number;
        orders: number;
        customers: number;
        revenue: number;
        lowStockCount: number;
    };
    getOverview(): {
        range: string;
        revenue: number;
        orders: number;
        newCustomers: number;
        conversionRate: number;
    };
    getSales(): {
        topProducts: {
            id: string;
            title: string;
            revenue: number;
        }[];
    };
    getTraffic(): {
        uv: number;
        pv: number;
        mobileShare: number;
        topCountries: {
            country: string;
            visits: number;
        }[];
    };
    getChannels(): {
        channels: {
            source: string;
            visits: number;
            orders: number;
            revenue: number;
        }[];
    };
}
