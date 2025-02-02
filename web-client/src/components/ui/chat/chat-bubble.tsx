import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ChatBubble
const chatBubbleVariant = cva(
    "flex gap-2 max-w-[60%] relative group",
    {
        variants: {
            variant: {
                received: "self-start flex-row items-end",
                sent: "self-end flex-row-reverse items-end",
            },
            layout: {
                default: "",
                ai: "max-w-full w-full items-center",
            },
        },
        defaultVariants: {
            variant: "received",
            layout: "default",
        },
    }
);

interface ChatBubbleProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatBubbleVariant> {}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
    ({ className, variant, layout, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(chatBubbleVariant({ variant, layout }), className)}
            {...props}
        >
            {children}
        </div>
    )
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleMessage
const chatBubbleMessageVariants = cva(
    "rounded-lg px-4 py-2 max-w-full break-words",
    {
        variants: {
            variant: {
                received: "bg-zinc-800 text-white",
                sent: "bg-blue-600 text-white",
            },
        },
        defaultVariants: {
            variant: "received",
        },
    }
);

interface ChatBubbleMessageProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatBubbleMessageVariants> {}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
    ({ className, variant, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(chatBubbleMessageVariants({ variant }), className)}
            {...props}
        >
            {children}
        </div>
    )
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
const ChatBubbleTimestamp = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "text-xs text-zinc-400 whitespace-nowrap",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
ChatBubbleTimestamp.displayName = "ChatBubbleTimestamp";

export {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
    chatBubbleVariant,
    chatBubbleMessageVariants,
}; 