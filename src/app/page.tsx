"use client";
import FileUploder from "@/components/FileUploader";
import ReceiptEditor from "@/components/ReceiptEditor";
import { useState } from "react";

export interface modelResponse {
  id: string;
  modelResponse: any;
}

export default function Home() {
  const [response, setResponse] = useState<modelResponse | null>(null);
  return (
    <div className="flex w-full h-full min-h-screen items-center justify-center">
      {response ? (
        <ReceiptEditor response={response} setResponse={setResponse} />
      ) : (
        <FileUploder setResponse={setResponse} />
      )}
    </div>
  );
}
