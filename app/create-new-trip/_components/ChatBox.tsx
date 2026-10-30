
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, LoaderCircle, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import TripDurationUi from "./TripDurationUi";
import FinalUi from "./FinalUi";

type Message = {
    role: "user" | "assistant";
    content: string;
    ui?: string;
};

type AIResponse = {
    resp: string;
    ui: string;
};

const UI_LABELS: Record<string, string> = {
    source: "Starting Location",
    destination: "Destination",
    groupSize: "Group Size",
    budget: "Budget",
    TripDuration: "Trip Duration",
    interests: "Travel Interests",
    preferences: "Special Requirements",
    Final: "Your Trip Plan",
};

function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [ui, setUi] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [retryMessage, setRetryMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    const sendMessage = async (text: string) => {
        const input = text.trim();

        if (!input || loading) return;

        const newMessage: Message = {
            role: "user",
            content: input,
        };

        const updatedMessages = [...messages, newMessage];

        setMessages(updatedMessages);
        setUserInput("");
        setLoading(true);
        setErrorMessage("");
        setRetryMessage(null);

        try {
            const { data } = await axios.post<AIResponse>(
                "/api/aimodel",
                {
                    messages: updatedMessages,
                }
            );

            if (
                typeof data.resp !== "string" ||
                typeof data.ui !== "string"
            ) {
                throw new Error("The AI returned an invalid response.");
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: data.resp,
                    ui: data.ui,
                },
            ]);

            setUi(data.ui);
        } catch (error: unknown) {
            let message =
                "Something went wrong. Please try again.";

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const serverMessage = error.response?.data?.message;

                if (status === 429) {
                    message =
                        "The AI service is busy. Please try again shortly.";
                } else if (status === 502) {
                    message =
                        serverMessage ||
                        "The AI service returned an invalid response. Please retry.";
                } else if (!error.response) {
                    message =
                        "Unable to connect to the AI service. Check your connection.";
                } else if (typeof serverMessage === "string") {
                    message = serverMessage;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }

            setErrorMessage(message);
            setRetryMessage(input);
        } finally {
            setLoading(false);
        }
    };

    const onSend = () => sendMessage(userInput);

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    const RenderGenerativeUi = (ui: string) => {
    if (ui === "budget") {
        return <BudgetUi onSelectOption={(v: string) => sendMessage(v)} />;
    }
    if (ui === "groupSize") {
        return <GroupSizeUi onSelectOption={(v: string) => sendMessage(v)} />;
    }
    if (ui === "TripDuration") {
        return <TripDurationUi onSelectOption={(v: string) => sendMessage(v)} />;
    }
    if (ui === "Final") {
        return <FinalUi onViewTrip={() => console.log("View trip clicked")} />;
    }
    return null;
};


    return (
        <div className="flex h-[80vh] flex-col">
            {messages?.length == 0 &&
                <EmptyBoxState onSelectOption={(v: string) => sendMessage(v)} />
            }
            {/* Chat messages */}
            <section
                className="flex-1 overflow-y-auto p-4"
                aria-live="polite"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mt-3 flex ${message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-4 py-2 sm:max-w-lg ${message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                                }`}
                        >
                            {message.content}
                            {RenderGenerativeUi(message.ui ?? '')}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Planning your trip...
                    </div>
                )}

                {errorMessage && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-destructive">
                        <p>{errorMessage}</p>

                        {retryMessage && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                onClick={() =>
                                    sendMessage(retryMessage)
                                }
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        )}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </section>

            {/* Current generative UI state */}
            {ui && (
                <div className="border-t px-4 py-2 text-sm text-muted-foreground">
                    Current step:{" "}
                    <span className="font-medium text-foreground">
                        {UI_LABELS[ui] ?? ui}
                    </span>
                </div>
            )}

            {/* Message input */}
            <section className="pt-2">
                <div className="relative rounded-2xl border bg-background p-4 shadow-sm">
                    <Textarea
                        id="trip-planner-input"
                        placeholder="Start typing here..."
                        className="min-h-24 w-full resize-none border-none bg-transparent pr-12 text-base shadow-none focus-visible:ring-0"
                        value={userInput}
                        onChange={(event) =>
                            setUserInput(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />

                    <Button
                        type="button"
                        size="icon"
                        className="absolute bottom-4 right-4 rounded-full"
                        onClick={onSend}
                        disabled={loading || !userInput.trim()}
                        aria-label="Send message"
                    >
                        {loading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                    Press Enter to send · Shift + Enter for a new line
                </p>
            </section>
        </div>
    );
}

export default ChatBox;
