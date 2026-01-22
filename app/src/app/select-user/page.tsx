"use client";

import { useUser, MEMBERS } from "@/contexts/user-context";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function SelectUserPage() {
    const { setCurrentUser } = useUser();
    const router = useRouter();

    const handleSelectUser = (user: typeof MEMBERS[0]) => {
        setCurrentUser(user);
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-serif text-primary mb-2">
                        VIENNA 2026
                    </h1>
                    <p className="text-muted-foreground">メンバーを選択してください</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {MEMBERS.map((member) => (
                        <Card
                            key={member.id}
                            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-border hover:border-primary"
                            onClick={() => handleSelectUser(member)}
                        >
                            <CardContent className="p-6 flex flex-col items-center gap-3">
                                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-center">{member.name}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    選択したメンバーは次回から自動的に使用されます
                </p>
            </div>
        </div>
    );
}
