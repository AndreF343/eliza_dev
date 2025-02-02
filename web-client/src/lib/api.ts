import type { UUID } from "@/types";

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = "http://localhost:3000"; // Make sure this matches your API server
    }

    async sendMessage(agentId: UUID, message: string) {
        const response = await fetch(`${this.baseUrl}/${agentId}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: message,
                user: "user"
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async getAgents() {
        const response = await fetch(`${this.baseUrl}/agents`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }
}

export const apiClient = new ApiClient(); 