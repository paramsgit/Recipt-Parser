"use client";

import * as React from "react";
import { modelResponse } from "@/app/page";
import { toast } from "sonner";
import {
  AlertTriangle,
  Save,
  Loader2,
  Receipt,
  IndianRupee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const ReceiptEditor = ({
  response,
  setResponse,
}: {
  response: modelResponse;
  setResponse: React.Dispatch<React.SetStateAction<modelResponse | null>>;
}) => {
  const [data, setData] = React.useState(response.modelResponse);
  const [loading, setLoading] = React.useState(false);

  const updateField = (field: string, value: any) => {
    setData((prev: typeof data) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...data.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setData((prev: typeof data) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/update/${response.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast.success("Receipt updated successfully!");
      setResponse(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Receipt className="size-6" />
              Receipt Review
            </CardTitle>

            <div className="text-sm text-muted-foreground">
              Confidence:{" "}
              <span className="font-semibold">
                {(data.confidence.overall * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {data.warnings.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem value="warnings">
                <AccordionTrigger className="text-amber-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4" />
                    Warnings ({data.warnings.length})
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-2">
                    {data.warnings.map((warning: string, index: number) => (
                      <div
                        key={index}
                        className="rounded-md border bg-amber-50 p-3 text-sm text-amber-700"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Input
                value={data.merchant ?? ""}
                onChange={(e) => updateField("merchant", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                value={data.date ?? ""}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={data.currency ?? ""}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Items</h3>
              <p className="text-sm text-muted-foreground">
                Edit extracted receipt items
              </p>
            </div>

            <div className="space-y-3">
              {data.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl border p-4"
                >
                  <div className="space-y-2 md:col-span-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(index, "amount", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="size-5" />
              <h3 className="font-semibold text-lg">Totals</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <Input
                  type="number"
                  value={data.subtotal ?? ""}
                  onChange={(e) =>
                    updateField("subtotal", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  value={data.tax ?? ""}
                  onChange={(e) => updateField("tax", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={data.discount ?? ""}
                  onChange={(e) =>
                    updateField("discount", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tip</Label>
                <Input
                  type="number"
                  value={data.tip ?? ""}
                  onChange={(e) => updateField("tip", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  type="number"
                  value={data.total ?? ""}
                  onChange={(e) => updateField("total", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setResponse(null);
              }}
              disabled={loading}
              className="flex-1"
              variant={"outline"}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Corrected Receipt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>{" "}
    </div>
  );
};

export default ReceiptEditor;
