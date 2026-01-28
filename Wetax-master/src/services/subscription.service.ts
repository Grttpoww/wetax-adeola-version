import { OpenAPI } from '../openapi'

export class SubscriptionService {
    public static async activateSubscription(params: {
        transactionId: string
        originalTransactionId?: string
        productId: string
        receipt: string
    }): Promise<{ success: boolean; subscription: any }> {
        const response = await fetch(`${OpenAPI.BASE}/v1/subscription/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OpenAPI.TOKEN}`,
            },
            body: JSON.stringify(params),
        })

        if (!response.ok) {
            throw new Error('Failed to activate subscription')
        }

        return response.json()
    }

    public static async checkSubscriptionStatus(): Promise<{
        isActive: boolean
        subscription?: any
        message?: string
    }> {
        const response = await fetch(`${OpenAPI.BASE}/v1/subscription/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OpenAPI.TOKEN}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to check subscription status')
        }

        return response.json()
    }

    public static async cancelSubscription(): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${OpenAPI.BASE}/v1/subscription/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OpenAPI.TOKEN}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to cancel subscription')
        }

        return response.json()
    }
}
