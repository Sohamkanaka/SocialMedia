"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    ImageIcon,
    BarChart3,
    X,
    Plus,
    Loader2,
    Calendar,
    Save,
    Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    useCreatePostMutation,
    useUploadFileMutation,
} from "@/store/api/postApi";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

type PostType = "TEXT" | "IMAGE" | "POLL";

const postTypes = [
    { value: "TEXT" as const, label: "Text", icon: FileText },
    { value: "IMAGE" as const, label: "Image", icon: ImageIcon },
    { value: "POLL" as const, label: "Poll", icon: BarChart3 },
];

export default function CreatePostPage() {
    usePageTitle("Create Post");
    const router = useRouter();
    const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const [type, setType] = useState<PostType>("TEXT");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadFile(formData).unwrap();
            setMediaUrl(result.url);
        } catch {
            setError("Failed to upload file. Please try again.");
            setMediaPreview(null);
        }
    };

    const addPollOption = () => {
        if (pollOptions.length < 6) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index: number, value: string) => {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    };

    const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
        setError(null);

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        if (type === "POLL") {
            const filledOptions = pollOptions.filter((opt) => opt.trim());
            if (filledOptions.length < 2) {
                setError("At least 2 poll options are required");
                return;
            }
        }

        if (type === "IMAGE" && !mediaUrl) {
            setError("Please upload an image first");
            return;
        }

        try {
            await createPost({
                title: title.trim(),
                content: content.trim() || undefined,
                type,
                status,
                mediaUrl: type === "IMAGE" ? mediaUrl : undefined,
                scheduledAt: isScheduled && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
                pollOptions:
                    type === "POLL"
                        ? pollOptions
                            .filter((opt) => opt.trim())
                            .map((text) => ({ text: text.trim() }))
                        : undefined,
            }).unwrap();

            router.push("/feed");
        } catch {
            setError("Failed to create post. Please try again.");
        }
    };

    const isSubmitting = isCreating || isUploading;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Create Post
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Share something with the community
                </p>
            </div>

            {/* Post Type Selector */}
            <div className="flex gap-2">
                {postTypes.map((pt) => {
                    const Icon = pt.icon;
                    return (
                        <Button
                            key={pt.value}
                            variant={type === pt.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setType(pt.value)}
                            className="gap-2"
                        >
                            <Icon className="h-4 w-4" />
                            {pt.label}
                        </Button>
                    );
                })}
            </div>

            {/* Post Form */}
            <Card className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        placeholder="Give your post a title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={300}
                        className="text-base"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {title.length}/300
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <Label htmlFor="content">
                        Content{" "}
                        <span className="text-muted-foreground">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="content"
                        placeholder="Write your post content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="resize-none"
                    />
                </div>

                {/* Image Upload */}
                {type === "IMAGE" && (
                    <div className="space-y-2">
                        <Label>Image</Label>
                        {mediaPreview ? (
                            <div className="relative rounded-lg border overflow-hidden">
                                <img
                                    src={mediaPreview}
                                    alt="Upload preview"
                                    className="w-full max-h-64 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => {
                                        setMediaPreview(null);
                                        setMediaUrl("");
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label
                                htmlFor="file-upload"
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-40",
                                    "border-2 border-dashed rounded-lg cursor-pointer",
                                    "hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                )}
                            >
                                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Click or drag to upload an image
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPEG, PNG, GIF, WebP (max 10MB)
                                </p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        )}
                    </div>
                )}

                {/* Poll Options */}
                {type === "POLL" && (
                    <div className="space-y-3">
                        <Label>Poll Options</Label>
                        {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                        updatePollOption(index, e.target.value)
                                    }
                                    maxLength={200}
                                />
                                {pollOptions.length > 2 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0"
                                        onClick={() =>
                                            removePollOption(index)
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {pollOptions.length < 6 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addPollOption}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Option
                            </Button>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {pollOptions.length}/6 options
                        </p>
                    </div>
                )}

                {/* Schedule Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Schedule Post
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Set a future publish date
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isScheduled}
                        onCheckedChange={setIsScheduled}
                    />
                </div>

                {isScheduled && (
                    <div className="space-y-2">
                        <Label htmlFor="schedule-date">Publish Date</Label>
                        <Input
                            id="schedule-date"
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                )}

                {/* Error */}
                {error && <FormError message={error} />}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary" className="text-xs">
                        {type}
                    </Badge>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit("DRAFT")}
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit("PUBLISHED")}
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Publish
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
