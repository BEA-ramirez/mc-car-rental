"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Loader2, FileText, Code, Eye, Braces } from "lucide-react";
import { toast } from "sonner";
import { getContractTemplate, saveContractTemplate } from "@/actions/settings";

const VARIABLES = [
  { label: "Customer Name", tag: "{{CUSTOMER_NAME}}" },
  { label: "Customer Address", tag: "{{CUSTOMER_ADDRESS}}" },
  { label: "Vehicle", tag: "{{CAR_BRAND_MODEL}}" },
  { label: "Plate Number", tag: "{{PLATE_NUMBER}}" },
  { label: "Start Date", tag: "{{START_DATE}}" },
  { label: "End Date", tag: "{{END_DATE}}" },
  { label: "Total Price", tag: "{{TOTAL_PRICE}}" },
  { label: "Security Deposit", tag: "{{SECURITY_DEPOSIT}}" },
];

const DEFAULT_TEMPLATE = `<h2>Vehicle Rental Agreement</h2>
<p>This Vehicle Rental Agreement is entered into between the Company and <strong>{{CUSTOMER_NAME}}</strong>.</p>
<h3>1. Vehicle Details</h3>
<p>The Company agrees to rent the following vehicle: <strong>{{CAR_BRAND_MODEL}}</strong> (Plate: {{PLATE_NUMBER}}).</p>
<h3>2. Rental Period & Fees</h3>
<p>The rental period is from <strong>{{START_DATE}}</strong> to <strong>{{END_DATE}}</strong>. The total rental fee is ₱{{TOTAL_PRICE}}, with a security deposit of ₱{{SECURITY_DEPOSIT}}.</p>
`;

export default function ContractTemplateBuilder() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await getContractTemplate();
        setContent(data || DEFAULT_TEMPLATE);
      } catch (error) {
        toast.error("Failed to load contract template.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  }, []);

  const insertVariable = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + tag + content.substring(end);

    setContent(newContent);

    // Reset focus and cursor position after React re-renders
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveContractTemplate(content);
      toast.success("Contract template saved successfully!");
    } catch (error) {
      toast.error("Failed to save contract template.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generates a preview by replacing tags with dummy data
  const generatePreview = () => {
    let preview = content;
    preview = preview.replace(/{{CUSTOMER_NAME}}/g, "Juan Dela Cruz");
    preview = preview.replace(
      /{{CUSTOMER_ADDRESS}}/g,
      "123 Ayala Ave, Makati City",
    );
    preview = preview.replace(/{{CAR_BRAND_MODEL}}/g, "Toyota Vios 1.3 XLE");
    preview = preview.replace(/{{PLATE_NUMBER}}/g, "ABC-1234");
    preview = preview.replace(/{{START_DATE}}/g, "Oct 15, 2025");
    preview = preview.replace(/{{END_DATE}}/g, "Oct 18, 2025");
    preview = preview.replace(/{{TOTAL_PRICE}}/g, "4,500.00");
    preview = preview.replace(/{{SECURITY_DEPOSIT}}/g, "3,000.00");
    return preview;
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Contract Builder...
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-4xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Master Rental Agreement
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Define the legal contract template. Use variables to inject dynamic
            booking data.
          </p>
        </div>
        <Button
          className="h-8 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          Save Contract
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col"
      >
        {/* Toolbar & Tabs */}
        <div className="border-b border-slate-200 bg-white px-2 pt-2 flex items-center justify-between">
          <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start">
            <TabsTrigger
              value="editor"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" /> HTML Editor
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="editor"
          className="m-0 flex flex-col md:flex-row border-none outline-none"
        >
          {/* Editor Area */}
          <div className="flex-1 p-0 border-r border-slate-100">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[500px] p-5 text-[13px] font-mono leading-relaxed text-slate-800 bg-slate-50/30 border-none resize-none focus:outline-none focus:ring-0"
              spellCheck={false}
              placeholder="Type your HTML contract here..."
            />
          </div>

          {/* Variables Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 p-4 shrink-0 flex flex-col gap-3 h-[500px] overflow-y-auto">
            <div className="flex items-center gap-1.5 mb-1">
              <Braces className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Dynamic Variables
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight mb-2">
              Click a variable to insert it at your cursor position.
            </p>

            <div className="flex flex-col gap-1.5">
              {VARIABLES.map((v) => (
                <Button
                  key={v.tag}
                  variant="outline"
                  className="h-8 justify-start text-[11px] font-mono font-medium text-blue-700 bg-blue-50/50 border-blue-200 hover:bg-blue-100 hover:text-blue-800 rounded-sm"
                  onClick={() => insertVariable(v.tag)}
                >
                  {v.tag}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="preview"
          className="m-0 border-none outline-none p-8 bg-slate-100 flex justify-center h-[500px] overflow-y-auto"
        >
          {/* Simulated PDF Paper */}
          <div className="bg-white border border-slate-200 shadow-sm max-w-2xl w-full p-10 min-h-full">
            <div
              className="prose prose-sm prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
