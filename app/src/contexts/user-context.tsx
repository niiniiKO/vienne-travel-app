"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile } from "@/types/database";

interface UserContextType {
    currentUser: Profile | null;
    setCurrentUser: (user: Profile | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "vienna-current-user";

// Fixed members
export const MEMBERS: Profile[] = [
    { id: "u1", name: "青山" },
    { id: "u2", name: "浅田" },
    { id: "u3", name: "市川" },
    { id: "u4", name: "鬼澤" },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUserState] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setCurrentUserState(user);
            } catch (error) {
                console.error("Failed to parse stored user:", error);
            }
        }
        setIsLoading(false);
    }, []);

    const setCurrentUser = (user: Profile | null) => {
        setCurrentUserState(user);
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
