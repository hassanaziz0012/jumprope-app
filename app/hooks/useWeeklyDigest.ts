import { useState, useRef, useEffect } from "react";
import EventSource from "react-native-sse";
import { generateWeeklyDigest } from "../../lib/aiCoach/weeklyDigest";
import type { Message } from "./useAIChat";

export function useWeeklyDigest() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [finalMessage, setFinalMessage] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Clean up EventSource on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const generateDigest = async () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setMessages([]);
        setFinalMessage(null);
        setIsGenerating(true);

        const es = await generateWeeklyDigest({
            onConversationId: () => {
                // Not needed for weekly digest
            },
            onStatus: (message) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "status",
                        text: message
                    }
                ]);
            },
            onToolCall: (tool, args) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "tool_call",
                        tool,
                        args,
                        completed: false
                    }
                ]);
            },
            onToolResult: (tool, result) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    for (let i = newMessages.length - 1; i >= 0; i--) {
                        if (newMessages[i].type === "tool_call" && newMessages[i].tool === tool && !newMessages[i].completed) {
                            newMessages[i] = {
                                ...newMessages[i],
                                completed: true,
                                result,
                            };
                            break;
                        }
                    }
                    return newMessages;
                });
            },
            onFinalResponse: (text) => {
                setFinalMessage(text);
                eventSourceRef.current = null;
                setIsGenerating(false);
            },
            onError: (message) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "error",
                        text: message || "An error occurred while generating your weekly digest."
                    }
                ]);
                eventSourceRef.current = null;
                setIsGenerating(false);
            }
        });

        eventSourceRef.current = es;
    };

    const reset = () => {
        setMessages([]);
        setFinalMessage(null);
    };

    return {
        messages,
        isGenerating,
        finalMessage,
        generateDigest,
        reset,
    };
}
