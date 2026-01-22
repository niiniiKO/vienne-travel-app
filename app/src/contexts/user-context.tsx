"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Profile, Tag } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface UserContextType {
    currentUser: Profile | null;
    setCurrentUser: (user: Profile | null) => void;
    isLoading: boolean;
    tags: Tag[];
    refreshTags: () => Promise<void>;
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
    const [tags, setTags] = useState<Tag[]>([]);

    const refreshTags = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("tags")
                .select("*")
                .order("name");
            
            if (error) throw error;
            setTags(data || []);
        } catch (err) {
            console.error("Failed to fetch tags:", err);
        }
    }, []);

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
        
        // Fetch tags on mount
        refreshTags();
    }, [refreshTags]);

    const setCurrentUser = (user: Profile | null) => {
        setCurrentUserState(user);
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading, tags, refreshTags }}>
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
