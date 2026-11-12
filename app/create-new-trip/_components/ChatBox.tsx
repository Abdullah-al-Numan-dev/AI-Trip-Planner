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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserDetail } from "@/app/provider";
import { v4 as uuidv4 } from "uuid";
import type { TripPlan } from "./types";

type Message = {
    role: "user" | "assistant";
    content: string;
    ui?: string;
};

type AIResponse = {
    resp: string;
    ui: string;
    trip_plan?: TripPlan;
    success?: boolean;
};

type ChatBoxProps = {
    onTripGenerated?: (trip: TripPlan, tripId: string) => void;
    onViewTrip?: () => void;
};

const UI_LABELS: Record<string, string> = {
    source: "Starting Location",
    destination: "Destination",
    groupSize: "Group Size",
    budget: "Budget",
    TripDuration: "Trip Duration",
    tripDuration: "Trip Duration",
    interests: "Travel Interests",
    preferences: "Special Requirements",
    Final: "Your Trip Plan",
    final: "Your Trip Plan",
};

function ChatBox({ onTripGenerated, onViewTrip }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [ui, setUi] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [retryMessage, setRetryMessage] = useState<string | null>(null);
    const [finalError, setFinalError] = useState<string | null>(null);
    const [tripDetail, setTripDetail] = useState<TripPlan>();
    const [tripId, setTripId] = useState<string>("");

    const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const { userDetail } = useUserDetail();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const handledFinalMessageIndex = useRef(-1);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [messages, loading]);

    const sendMessage = async (text: string = "", isFinalRequest: boolean = false) => {
        const input = text.trim();

        // Require text for normal messages, but allow empty text if triggered as final generation
        if ((!input && !isFinalRequest) || loading) return;

        let updatedMessages = [...messages];

        if (isFinalRequest) {
            // Send a hidden follow-up turn to the AI so the conversation context
            // is complete, without showing a fake user message in the chat.
            updatedMessages = [
                ...updatedMessages,
                {
                    role: "user",
                    content: input || "Generate the final trip plan.",
                },
            ];
        } else if (input) {
            const newMessage: Message = {
                role: "user",
                content: input,
            };
            updatedMessages = [...updatedMessages, newMessage];
            setMessages(updatedMessages);
            setUserInput("");
        }

        setLoading(true);
        setErrorMessage("");
        setRetryMessage(null);

        if (isFinalRequest) {
            setFinalError(null);
        }

        try {
            const { data } = await axios.post<AIResponse>(
                "/api/aimodel",
                {
                    messages: updatedMessages,
                    isFinal: isFinalRequest,
                }
            );

            console.log("TRIP", data);

            if (isFinalRequest) {
                if (data?.trip_plan) {
                    setTripDetail(data.trip_plan);
                    setFinalError(null);
                    const newTripId = uuidv4();
                    setTripId(newTripId);
                    onTripGenerated?.(data.trip_plan, newTripId);
                    await SaveTripDetail({
                        tripDetail: data.trip_plan,
                        tripId: newTripId,
                        uid: userDetail?._id,
                    });
                } else {
                    setFinalError(
                        "The AI did not return a trip plan. Please try again."
                    );
                }
            } else {
                setMessages((previous) => [
                    ...previous,
                    {
                        role: "assistant",
                        content: data.resp,
                        ui: data.ui,
                    },
                ]);
            }

            if (data?.ui) {
                setUi(data.ui);
            }
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

            if (isFinalRequest) {
                setFinalError(message);
            } else {
                setErrorMessage(message);
                setRetryMessage(input);
            }
        } finally {
            setLoading(false);
        }
    };

    const onSend = (final: boolean = false) => sendMessage(userInput, final);

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    const RenderGenerativeUi = (rawUi: string) => {
        const normalized = rawUi.toLowerCase();
        if (normalized === "budget") {
            return <BudgetUi onSelectOption={(v: string) => sendMessage(v)} />;
        }
        if (normalized === "groupsize") {
            return <GroupSizeUi onSelectOption={(v: string) => sendMessage(v)} />;
        }
        if (normalized === "tripduration") {
            return <TripDurationUi onSelectOption={(v: string) => sendMessage(v)} />;
        }
        if (normalized === "final") {
            return (
                <FinalUi
                    tripDetail={tripDetail}
                    loading={loading}
                    disabled={loading || !tripDetail}
                    error={finalError}
                    onRetry={() => sendMessage("", true)}
                    onViewTrip={() => {
                        console.log(
                            "View trip clicked. Trip ID:",
                            tripId,
                            "Details:",
                            tripDetail
                        );
                        onViewTrip?.();
                    }}
                />
            );
        }
        return null;
    };

    useEffect(() => {
        const lastMessageIndex = messages.length - 1;
        const lastMessage = messages[lastMessageIndex];

        // Only generate once per final message. The ref guard also prevents
        // React Strict Mode from firing two duplicate final requests.
        if (
            lastMessage?.ui?.toLowerCase() === "final" &&
            handledFinalMessageIndex.current !== lastMessageIndex
        ) {
            handledFinalMessageIndex.current = lastMessageIndex;
            sendMessage("", true);
        }
    }, [messages]);

    const isFinalStep =
        messages[messages.length - 1]?.ui?.toLowerCase() === "final";

    return (
        <div className="flex h-full min-h-0 flex-col">
            {messages?.length == 0 && (
                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
                    <EmptyBoxState
                        onSelectOption={(v: string) => sendMessage(v)}
                    />
                </div>
            )}

            {/* Chat messages */}
            <section
                className={`overflow-y-auto p-4 ${
                    messages?.length == 0 ? "hidden" : "min-h-0 flex-1"
                }`}
                aria-live="polite"
            >
                {messages.map((message, index) => {
                    const isFinalMessage =
                        message.ui?.toLowerCase() === "final";

                    return (
                        <div
                            key={index}
                            className={`mt-3 flex ${message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`${
                                    isFinalMessage
                                        ? "w-full max-w-[95%] sm:max-w-xl"
                                        : "max-w-[85%] sm:max-w-lg"
                                } whitespace-pre-wrap break-words rounded-lg px-4 py-2 ${
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                }`}
                            >
                                {/* The raw final plan is hidden; the structured
                                    plan is shown when "View Trip" is clicked. */}
                                {!isFinalMessage && message.content}
                                {RenderGenerativeUi(message.ui ?? '')}
                            </div>
                        </div>
                    );
                })}

                {loading && !isFinalStep && (
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
            <section className="shrink-0 pt-2">
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
                        onClick={() => onSend()}
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
