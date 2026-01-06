import { useState, useEffect } from 'react';
import { getAvailableNuances } from '@/api/services/ai/nuance';
import type { AiNuanceOption } from '@/dto/ai';

export function useNuances() {
    const [nuances, setNuances] = useState<AiNuanceOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNuances = async () => {
            try {
                const response = await getAvailableNuances();
                if (response && response.data) {
                    setNuances(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch nuances:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNuances();
    }, []);

    return { nuances, isLoading };
}
