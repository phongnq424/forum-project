import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { Profile } from '$lib/types/profile.type';

export const profileService = {
    async getMyProfile() {
        return await api.get<Profile>(ENDPOINTS.PROFILE.ME);
    },

    async getProfileById(userId: string) {
        return await api.get<Profile>(ENDPOINTS.PROFILE.BY_ID(userId));
    },

    async updateProfile(data: any) {
        return await api.put<Profile>(ENDPOINTS.PROFILE.ME, data);
    },

    async searchProfiles(query: string) {
        return await api.get<any[]>(`${ENDPOINTS.PROFILE.SEARCH}?query=${query}`);
    }
};