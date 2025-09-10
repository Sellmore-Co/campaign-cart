interface UserData {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
    visitorId?: string;
    sessionId?: string;
    [key: string]: any;
}
declare class UserDataStorage {
    private static instance;
    private userData;
    private cookieExpiryDays;
    private constructor();
    static getInstance(): UserDataStorage;
    private setCookie;
    private getCookie;
    private deleteCookie;
    private loadUserData;
    private saveUserData;
    private generateId;
    updateUserData(data: Partial<UserData>): void;
    getUserData(): UserData;
    getUserField(field: keyof UserData): any;
    clearUserData(): void;
    isIdentified(): boolean;
    updateFromFormFields(): void;
}
export declare const userDataStorage: UserDataStorage;
export type { UserData };
//# sourceMappingURL=userDataStorage.d.ts.map