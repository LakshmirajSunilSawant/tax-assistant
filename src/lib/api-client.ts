import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chat endpoints
export const chatApi = {
    sendMessage: async (message: string, conversationId?: string, userId?: string) => {
        const response = await apiClient.post('/api/chat/', {
            message,
            conversation_id: conversationId,
            user_id: userId || 'default',
        });
        return response.data;
    },

    getHistory: async (conversationId: string) => {
        const response = await apiClient.get(`/api/chat/history/${conversationId}`);
        return response.data;
    },

    resetConversation: async (conversationId: string) => {
        const response = await apiClient.post(`/api/chat/reset/${conversationId}`);
        return response.data;
    },
};

// ITR endpoints
export const itrApi = {
    determineForm: async (data: {
        income_sources: string[];
        total_income?: number;
        is_director?: boolean;
        has_foreign_assets?: boolean;
        house_properties_count?: number;
        has_capital_gains?: boolean;
        is_business?: boolean;
        is_profession?: boolean;
        business_turnover?: number;
        professional_income?: number;
        use_presumptive?: boolean;
    }) => {
        const response = await apiClient.post('/api/itr/determine', data);
        return response.data;
    },

    getAllForms: async () => {
        const response = await apiClient.get('/api/itr/forms');
        return response.data;
    },

    validateSelection: async (data: {
        selected_itr: string;
        income_sources: string[];
        total_income?: number;
        is_director?: boolean;
        has_foreign_assets?: boolean;
        has_capital_gains?: boolean;
    }) => {
        const response = await apiClient.post('/api/itr/validate', data);
        return response.data;
    },
};

// Deductions endpoints
export const deductionsApi = {
    getSuggestions: async (data: {
        income_sources: string[];
        age?: number;
        has_home_loan?: boolean;
        has_education_loan?: boolean;
        has_health_insurance?: boolean;
        is_salaried?: boolean;
        tax_regime?: string;
    }) => {
        const response = await apiClient.post('/api/deductions/suggest', data);
        return response.data;
    },

    getAllSections: async () => {
        const response = await apiClient.get('/api/deductions/sections');
        return response.data;
    },

    calculateTax: async (data: {
        total_income: number;
        deductions: Record<string, number>;
        tax_regime?: string;
        age?: number;
    }) => {
        const response = await apiClient.post('/api/deductions/calculate-tax', data);
        return response.data;
    },
};

// Validation endpoints
export const validationApi = {
    checkTaxData: async (data: {
        user_data: any;
        form_26as_data?: any;
        ais_data?: any;
    }) => {
        const response = await apiClient.post('/api/validation/check', data);
        return response.data;
    },

    validate26AS: async (data: {
        declared_salary: number;
        declared_tds: number;
        form_26as_salary: number;
        form_26as_tds: number;
    }) => {
        const response = await apiClient.post('/api/validation/form26as', data);
        return response.data;
    },

    getCommonErrors: async () => {
        const response = await apiClient.get('/api/validation/common-errors');
        return response.data;
    },
};

export default apiClient;
