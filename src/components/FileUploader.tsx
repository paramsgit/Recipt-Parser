"use client";

import { FileText, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { modelResponse } from "@/app/page";

export const title = "Document Upload Card";

const FileUploder = ({
  setResponse,
}: {
  setResponse: React.Dispatch<React.SetStateAction<modelResponse | null>>;
}) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setResponse(data);
      toast.success("Receipt parsed successfully!");
      console.log("Parsed response:", data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md h-full ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload your documents for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          value={files}
          onValueChange={setFiles}
          accept=".jpg,.png,image/png,image/jpeg,image/jpg"
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
        >
          <FileUploadDropzone>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Drop your documents here</p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3">
                Select Files
              </Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file, index) => (
              <FileUploadItem key={index} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X className="size-4" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
        <Button
          onClick={handleSubmit}
          className="mt-4 w-full"
          disabled={files.length === 0}
        >
          {loading ? "Uploading..." : "Submit Documents"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploder;
