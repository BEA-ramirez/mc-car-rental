"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Loader2, FileText, Code, Eye, Braces } from "lucide-react";
import { toast } from "sonner";
import { getContractTemplate, saveContractTemplate } from "@/actions/settings";

// --- EXPANDED VARIABLES TO MATCH THE CLIENT'S DOCX ---
const VARIABLES = [
  { label: "Customer Name", tag: "{{CUSTOMER_NAME}}" },
  { label: "Customer Address", tag: "{{CUSTOMER_ADDRESS}}" },
  { label: "Customer Contact", tag: "{{CUSTOMER_PHONE}}" },
  { label: "Vehicle Brand & Model", tag: "{{CAR_BRAND_MODEL}}" },
  { label: "Plate Number", tag: "{{PLATE_NUMBER}}" },
  { label: "Start Date & Time", tag: "{{START_DATE}}" },
  { label: "End Date & Time", tag: "{{END_DATE}}" },
  { label: "Total Rental Fee", tag: "{{TOTAL_PRICE}}" },
  { label: "Destination", tag: "{{DESTINATION}}" },
  { label: "Authorized Drivers", tag: "{{AUTHORIZED_DRIVERS}}" },
  { label: "License Numbers", tag: "{{LICENSE_NUMBERS}}" },
];

// --- EXACT REPLICA OF THE CLIENT'S DOCX FORMATTING ---
const DEFAULT_TEMPLATE = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.5;">
  <h2 style="text-align: center; margin-bottom: 5px;">CONTRACT OF LEASE</h2>
  <h3 style="text-align: center; margin-top: 0; font-weight: normal;">(VEHICLE)</h3>
  
  <p><strong>KNOW ALL MEN BY THESE PRESENTS:</strong></p>
  <p>This Contract of Lease made and entered into by and between:</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 20%;"></th>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 40%;">LESSOR</th>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 40%;">LESSEE</th>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">NAME</td>
      <td style="border: 1px solid black; padding: 8px;">S.T.S. TRANSPORT SERVICES<br>c/o Catherine Pabonan</td>
      <td style="border: 1px solid black; padding: 8px;">{{CUSTOMER_NAME}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">ADDRESS</td>
      <td style="border: 1px solid black; padding: 8px;">Brgy. Sabang Bao Ormoc City, Leyte</td>
      <td style="border: 1px solid black; padding: 8px;">{{CUSTOMER_ADDRESS}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">CONTACT NO.</td>
      <td style="border: 1px solid black; padding: 8px;">09677015349</td>
      <td style="border: 1px solid black; padding: 8px;">{{CUSTOMER_PHONE}}</td>
    </tr>
  </table>

  <p>Subject to the terms and conditions stated below the parties agrees as follows:</p>
  
  <p><strong>RENTED VEHICLE DESCRIPTIONS.</strong></p>
  <table style="width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="width: 50%;">Brand: <strong>{{CAR_BRAND_MODEL}}</strong></td>
      <td style="width: 50%;">Fuel Type: <strong>Unleaded/Diesel</strong></td>
    </tr>
    <tr>
      <td>Color: <strong>As assigned</strong></td>
      <td>Fuel Level: <strong>Full / As received</strong></td>
    </tr>
    <tr>
      <td>Plate/Induction No.: <strong>{{PLATE_NUMBER}}</strong></td>
      <td>Destination: <strong>{{DESTINATION}}</strong></td>
    </tr>
  </table>

  <p><strong>RENTAL PERIOD.</strong> The lessor agrees to rent the vehicle to lessee for the following period.</p>
  <table style="width: 100%; margin-bottom: 10px;">
    <tr>
      <td style="width: 50%;">Start time/date:<br><strong>{{START_DATE}}</strong></td>
      <td style="width: 50%;">End time/date:<br><strong>{{END_DATE}}</strong></td>
    </tr>
  </table>
  <p style="font-size: 0.9em; font-style: italic;">Penalty per hour rate is Php 150 maximum of 4 hours. Exceeding 4 hours will be good as 24 hours.</p>

  <p><strong>RENTAL PAYMENT.</strong> The total rental fee is Php <strong>{{TOTAL_PRICE}}</strong>. We require payment first policy.</p>
  
  <p><strong>AUTHORIZED DRIVERS.</strong><br>
  Drivers Name: <strong>{{AUTHORIZED_DRIVERS}}</strong><br>
  License Number: <strong>{{LICENSE_NUMBERS}}</strong></p>

  <ul style="padding-left: 20px;">
    <li>Shall pay the agreed rent to the lessor upon the execution of the contract or, in the case of a monthly basis, at the end of the month.</li>
    <li>Shall be responsible for paying the costs of repair or restoration to good condition in the event of a vehicle accident, vehicle damage sustained, or loss of parts or keys while the vehicle is still under the lessee's control.</li>
    <li>If the driver is provided by the lessor, the lessee has the obligation to closely monitor the driver to ensure he performs faithfully his obligations to drive the car with the utmost diligence to avoid accidents;</li>
    <li>During said vehicular mishap, if a third person or persons are affected, the lessee shall shoulder the related expenses or obligations to the victim of whatever nature as related to the said case;</li>
    <li>Failure to return the vehicle on the agreed date and time makes the lessee liable for the additional rent thereof until it is in the full custody of the lessor.</li>
    <li>A Penalty of PHP 450 shall be paid to the Lessor if the vehicle is returned dirty.</li>
  </ul>

  <p>The parties agree to the terms and conditions set forth above, as demonstrated by their signatures as follows:</p>

  <table style="width: 100%; margin-top: 40px; text-align: center;">
    <tr>
      <td style="width: 50%;"><strong>LESSOR:</strong></td>
      <td style="width: 50%;"><strong>LESSEE:</strong></td>
    </tr>
    <tr>
      <td style="padding-top: 30px;">_________________________<br>Name: Catherine Pabonan</td>
      <td style="padding-top: 30px;">_________________________<br>Name: {{CUSTOMER_NAME}}</td>
    </tr>
    <tr>
      <td style="padding-top: 20px;">Date: ____________________</td>
      <td style="padding-top: 20px;">Date: ____________________</td>
    </tr>
  </table>
</div>`;

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
        // If data exists and isn't just whitespace, use it. Otherwise use our new default.
        setContent(data && data.trim().length > 0 ? data : DEFAULT_TEMPLATE);
      } catch (error) {
        toast.error("Failed to load contract template.");
        setContent(DEFAULT_TEMPLATE);
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
    preview = preview.replace(/{{CUSTOMER_PHONE}}/g, "0917-123-4567");
    preview = preview.replace(/{{CAR_BRAND_MODEL}}/g, "Toyota Vios 1.3 XLE");
    preview = preview.replace(/{{PLATE_NUMBER}}/g, "ABC-1234");
    preview = preview.replace(/{{START_DATE}}/g, "Oct 15, 2025 / 09:00 AM");
    preview = preview.replace(/{{END_DATE}}/g, "Oct 18, 2025 / 09:00 AM");
    preview = preview.replace(/{{TOTAL_PRICE}}/g, "4,500.00");
    preview = preview.replace(/{{DESTINATION}}/g, "WITHIN LEYTE");
    preview = preview.replace(
      /{{AUTHORIZED_DRIVERS}}/g,
      "Juan Dela Cruz / Maria Santos",
    );
    preview = preview.replace(
      /{{LICENSE_NUMBERS}}/g,
      "N01-23-456789 / N02-34-567890",
    );
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
              className="w-full h-[600px] p-5 text-[13px] font-mono leading-relaxed text-slate-800 bg-slate-50/30 border-none resize-none focus:outline-none focus:ring-0 custom-scrollbar"
              spellCheck={false}
              placeholder="Type your HTML contract here..."
            />
          </div>

          {/* Variables Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 p-4 shrink-0 flex flex-col gap-3 h-[600px] overflow-y-auto custom-scrollbar">
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
          className="m-0 border-none outline-none p-8 bg-slate-100 flex justify-center h-[600px] overflow-y-auto custom-scrollbar"
        >
          {/* Simulated PDF Paper */}
          <div className="bg-white border border-slate-200 shadow-sm max-w-3xl w-full p-12 min-h-full">
            <div
              className="prose prose-sm prose-slate max-w-none prose-p:my-2 prose-li:my-0.5"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
