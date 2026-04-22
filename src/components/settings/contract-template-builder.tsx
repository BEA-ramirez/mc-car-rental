"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Loader2, FileText, Code, Eye, Braces } from "lucide-react";
import { toast } from "sonner";
import { getContractTemplate, saveContractTemplate } from "@/actions/settings";

// --- EXPANDED VARIABLES TO MATCH THE CLIENT'S DOCX ---
const VARIABLES = [
  { label: "Company Name", tag: "{{COMPANY_NAME}}" },
  { label: "Company Address", tag: "{{COMPANY_ADDRESS}}" },
  { label: "Company Phone", tag: "{{COMPANY_PHONE}}" },
  { label: "Staff/Admin Name", tag: "{{STAFF_NAME}}" },
  { label: "Customer Name", tag: "{{CUSTOMER_NAME}}" },
  { label: "Customer Address", tag: "{{CUSTOMER_ADDRESS}}" },
  { label: "Customer Contact", tag: "{{CUSTOMER_PHONE}}" },
  { label: "Vehicle Brand & Model", tag: "{{CAR_BRAND_MODEL}}" },
  { label: "Plate Number", tag: "{{PLATE_NUMBER}}" },
  { label: "Car Color", tag: "{{CAR_COLOR}}" },
  { label: "Fuel Type", tag: "{{FUEL_TYPE}}" },
  { label: "Fuel Level", tag: "{{FUEL_LEVEL}}" },
  { label: "Start Date & Time", tag: "{{START_DATE}}" },
  { label: "End Date & Time", tag: "{{END_DATE}}" },
  { label: "Total Rental Fee", tag: "{{TOTAL_PRICE}}" },
  { label: "Destination", tag: "{{DESTINATION}}" },
  { label: "Authorized Drivers", tag: "{{AUTHORIZED_DRIVERS}}" },
  { label: "License Numbers", tag: "{{LICENSE_NUMBERS}}" },
];

// --- EXACT REPLICA OF THE CLIENT'S DOCX FORMATTING WITH DYNAMIC TAGS ---
const DEFAULT_TEMPLATE = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.5; font-size: 14px; color: #000;">
  <h2 style="text-align: center; margin-bottom: 5px; font-size: 18px; text-decoration: underline;">CONTRACT OF LEASE</h2>
  <h3 style="text-align: center; margin-top: 0; font-weight: normal; font-size: 16px;">(VEHICLE)</h3>
  
  <p style="font-weight: bold; margin-top: 20px; font-size: 16px;">KNOW ALL MEN BY THESE PRESENTS:</p>
  <p style="margin-bottom: 20px;">This Contract of Lease made and entered into by and between:</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
    <tr>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 20%;"></th>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 40%; font-weight: bold;">LESSOR</th>
      <th style="border: 1px solid black; padding: 8px; text-align: left; width: 40%; font-weight: bold;">LESSEE</th>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">NAME</td>
      <td style="border: 1px solid black; padding: 8px;"><strong>{{COMPANY_NAME}}</strong><br>c/o {{STAFF_NAME}}</td>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">{{CUSTOMER_NAME}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">ADDRESS</td>
      <td style="border: 1px solid black; padding: 8px;">{{COMPANY_ADDRESS}}</td>
      <td style="border: 1px solid black; padding: 8px;">{{CUSTOMER_ADDRESS}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; font-weight: bold;">CONTACT NO.</td>
      <td style="border: 1px solid black; padding: 8px;">{{COMPANY_PHONE}}</td>
      <td style="border: 1px solid black; padding: 8px;">{{CUSTOMER_PHONE}}</td>
    </tr>
  </table>

  <p style="margin-bottom: 8px;">Subject to the terms and conditions stated below the parties agrees as follows:</p>
  
  <p style="margin-bottom: 8px; font-size: 16px;"><strong>A. RENTED VEHICLE DESCRIPTIONS.</strong></p>
  <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
    <tr>
      <td style="width: 50%; padding-bottom: 5px;">Brand/Model: <span style="text-decoration: underline;">&nbsp;<strong>{{CAR_BRAND_MODEL}}</strong>&nbsp;</span></td>
      <td style="width: 50%; padding-bottom: 5px;">Fuel Type: <span style="text-decoration: underline;">&nbsp;<strong>{{FUEL_TYPE}}</strong>&nbsp;</span></td>
    </tr>
    <tr>
      <td style="padding-bottom: 5px;">Color: <span style="text-decoration: underline;">&nbsp;<strong>{{CAR_COLOR}}</strong>&nbsp;</span></td>
      <td style="padding-bottom: 5px;">Fuel Level: <span style="text-decoration: underline;">&nbsp;<strong>{{FUEL_LEVEL}}</strong>&nbsp;</span></td>
    </tr>
    <tr>
      <td style="padding-bottom: 5px;">Plate/Induction No.: <span style="text-decoration: underline;">&nbsp;<strong>{{PLATE_NUMBER}}</strong>&nbsp;</span></td>
      <td style="padding-bottom: 5px;">Destination: <span style="text-decoration: underline;">&nbsp;<strong>{{DESTINATION}}</strong>&nbsp;</span></td>
    </tr>
  </table>

  <p style="margin-bottom: 8px; font-size: 16px;"><strong>B. RENTAL PERIOD.</strong> <span style="font-size: 14px;">The lessor agrees to rent the vehicle to lessee for the following period.</span> </p>
  <table style="width: 100%; margin-bottom: 10px; font-size: 14px;">
    <tr>
      <td style="width: 50%;">Start time/date:<br><strong><span style="text-decoration: underline;">&nbsp;{{START_DATE}}&nbsp;</span></strong></td>
      <td style="width: 50%;">End time/date:<br><strong><span style="text-decoration: underline;">&nbsp;{{END_DATE}}&nbsp;</span></strong></td>
    </tr>
  </table>
  <p style="font-size: 12px; font-style: italic; color: #444;">*Penalty per hour rate is Php 150 maximum of 4 hours. Exceeding 4 hours will be good as 24 hours.</p>

  <p style="margin-bottom: 8px; margin-top: 10px; font-size: 16px;"><strong>C. RENTAL PAYMENT.</strong> The total rental fee is Php <strong><span style="text-decoration: underline; font-size: 14px;">&nbsp;{{TOTAL_PRICE}}&nbsp;</span></strong>. We require a payment first policy.</p>
  
  <p style="margin-bottom: 8px; margin-top: 10px; font-size: 16px;"><strong>D. AUTHORIZED DRIVERS.</strong></p>
  <div style="margin-left: 20px; margin-bottom: 20px;">
    <p style="margin: 2px 0;">Drivers Name: <strong><span style="text-decoration: underline;">&nbsp;{{AUTHORIZED_DRIVERS}}&nbsp;</span></strong></p>
    <p style="margin: 2px 0;">License Number: <strong><span style="text-decoration: underline;">&nbsp;{{LICENSE_NUMBERS}}&nbsp;</span></strong></p>
  </div>

  <p><strong>E. OBLIGATIONS OF LESSOR.</strong> </p>
  <ul style="padding-left: 20px; margin-bottom: 30px; text-align: justify;">
    <li style="margin-bottom: 8px;">1. Ensure the vehicle is clean and in good condition.</li>
    <li style="margin-bottom: 8px;">2. Comply with the necessary maintenance of the vehicle pertaining to essential parts of the vehicle except for vulcanizing the tire, which is the lessee’s obligation.</li>
    <li style="margin-bottom: 8px;">3. In cases requested by the lessees, we provide a driver, but his salary shall be shouldered by the lessee on the days covered by the travel period.</li>
  </ul>

<p><strong>F. OBLIGATIONS OF THE LESSEE:</strong> </p>
  <ul style="padding-left: 20px; margin-bottom: 30px; text-align: justify;">
    <li style="margin-bottom: 8px;">1. Shall provide the necessary fuel during the travel period.</li>
    <li style="margin-bottom: 8px;">2. Shall pay the agreed rent to the lessor upon the execution of the contract or, in the case of a monthly basis, at the end of the month.</li>
    <li style="margin-bottom: 8px;">3. Shall be responsible for paying the costs of repair or restoration to good condition in the event of a vehicle accident, vehicle damage sustained, or loss of parts or keys while the vehicle is still under the lessee's control.</li>
    <li style="margin-bottom: 8px;">4. If the driver is provided by the lessor, the lessee has the obligation to closely monitor the driver to ensure he performs faithfully his obligations to drive the car with the utmost diligence to avoid accidents;</li>
    <li style="margin-bottom: 8px;">5. During said vehicular mishap, if a third person or persons are affected, the lessee shall shoulder the related expenses or obligations to the victim of whatever nature as related to the said case;</li>
    <li style="margin-bottom: 8px;">6. Failure to return the vehicle on the agreed date and time makes the lessee liable for the additional rent thereof until it is in the full custody of the lessor.</li>
    <li style="margin-bottom: 8px;">7. A Penalty of PHP 450 shall be paid to the Lessor if the vehicle is returned dirty.</li>
  </ul>

  <p>The parties agree to the terms and conditions set forth above, as demonstrated by their signatures as follows:</p>

  <table style="width: 100%; margin-top: 30px; text-align: center; font-size: 14px;">
    <tr>
      <td style="width: 50%;"><strong>LESSOR:</strong></td>
      <td style="width: 50%;"><strong>LESSEE:</strong></td>
    </tr>
    <tr>
      <td style="padding-top: 40px;">_________________________<br>{{STAFF_NAME}}</td>
      <td style="padding-top: 40px;">_________________________<br>{{CUSTOMER_NAME}}</td>
    </tr>
    <tr>
      <td style="padding-top: 20px;">Date: ____________________</td>
      <td style="padding-top: 20px;">Date: ____________________</td>
    </tr>
  </table>

  <div style="margin-top: 30px;">
    <p><strong>Signed in the presence of:</strong></p>
    <p>1. _________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2. _________________________</p>
  </div>
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
        setContent(data && data.trim().length > 0 ? data : DEFAULT_TEMPLATE);
      } catch {
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
    } catch {
      toast.error("Failed to save contract template.");
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = () => {
    let preview = content;
    // Lessor Data
    preview = preview.replace(/{{COMPANY_NAME}}/g, "S.T.S. TRANSPORT SERVICES");
    preview = preview.replace(
      /{{COMPANY_ADDRESS}}/g,
      "Brgy. Sabang Bao Ormoc City, Leyte",
    );
    preview = preview.replace(/{{COMPANY_PHONE}}/g, "09677015349");
    preview = preview.replace(/{{STAFF_NAME}}/g, "Catherine Pabonan");

    // Lessee Data
    preview = preview.replace(/{{CUSTOMER_NAME}}/g, "Juan Dela Cruz");
    preview = preview.replace(
      /{{CUSTOMER_ADDRESS}}/g,
      "123 Ayala Ave, Makati City",
    );
    preview = preview.replace(/{{CUSTOMER_PHONE}}/g, "0917-123-4567");

    // Vehicle Data
    preview = preview.replace(/{{CAR_BRAND_MODEL}}/g, "Toyota Vios 1.3 XLE");
    preview = preview.replace(/{{PLATE_NUMBER}}/g, "ABC-1234");
    preview = preview.replace(/{{CAR_COLOR}}/g, "Pearl White");
    preview = preview.replace(/{{FUEL_TYPE}}/g, "Unleaded");
    preview = preview.replace(/{{FUEL_LEVEL}}/g, "Full Tank");

    // Booking Data
    preview = preview.replace(/{{START_DATE}}/g, "Oct 15, 2026 / 09:00 AM");
    preview = preview.replace(/{{END_DATE}}/g, "Oct 18, 2026 / 09:00 AM");
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
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Contract Builder...
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-4xl transition-colors">
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Master Rental Agreement
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Define the legal contract template using dynamic variables
            </p>
          </div>
        </div>
        <Button
          className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
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
        <div className="border-b border-border bg-secondary/30 px-3 pt-2 flex items-center justify-between transition-colors">
          <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start">
            <TabsTrigger
              value="editor"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" /> HTML Editor
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="editor"
          className="m-0 flex flex-col md:flex-row border-none outline-none bg-background transition-colors"
        >
          <div className="flex-1 p-0 border-r border-border transition-colors">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[500px] p-5 text-[12px] font-mono leading-relaxed text-foreground bg-background border-none resize-none focus:outline-none focus:ring-0 custom-scrollbar"
              spellCheck={false}
              placeholder="Type your HTML contract here..."
            />
          </div>

          <div className="w-full md:w-60 bg-secondary/30 p-4 shrink-0 flex flex-col gap-3 h-[500px] overflow-y-auto custom-scrollbar transition-colors border-l border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Braces className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Dynamic Variables
              </h3>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/70 leading-tight mb-2">
              Click a variable to insert it at your cursor position.
            </p>

            <div className="flex flex-col gap-1.5">
              {VARIABLES.map((v) => (
                <Button
                  key={v.tag}
                  variant="outline"
                  className="h-8 justify-start text-[10px] font-mono font-bold text-foreground bg-secondary/50 border-border hover:bg-secondary rounded-md shadow-none transition-colors"
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
          className="m-0 border-none outline-none p-6 bg-secondary/50 flex justify-center h-[500px] overflow-y-auto custom-scrollbar transition-colors"
        >
          <div className="bg-white border border-border shadow-sm max-w-3xl w-full p-10 min-h-full transition-colors text-black">
            <div
              className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-0.5"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
