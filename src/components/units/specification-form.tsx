"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  carSpecificationSchema,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  BODY_TYPES,
} from "@/lib/schemas/car";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";

type SpecificationFormValues = z.infer<typeof carSpecificationSchema>;

interface Props {
  initialData?: SpecificationFormValues | null;
  onClose: () => void;
  onSuccess?: (newSpecId: string) => void;
}

export function SpecificationForm({ initialData, onClose, onSuccess }: Props) {
  const { saveSpecification } = useFleetSettings();

  const form = useForm({
    resolver: zodResolver(carSpecificationSchema),
    defaultValues: {
      spec_id: initialData?.spec_id,
      name: initialData?.name || "",
      engine_type: initialData?.engine_type || "",
      transmission: initialData?.transmission || "",
      fuel_type: initialData?.fuel_type || "",
      body_type: initialData?.body_type || "",
      passenger_capacity: initialData?.passenger_capacity ?? 5,
      luggage_capacity: initialData?.luggage_capacity ?? 2,
      buffer_hours: initialData?.buffer_hours ?? 12,
      is_archived: false,
    },
  });

  const onSubmit = async (data: SpecificationFormValues) => {
    try {
      const result = await saveSpecification(data);
      if (result.success && result.spec_id) {
        if (onSuccess) onSuccess(result.spec_id);
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Button variant="ghost" size="icon-sm" onClick={onClose} type="button">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-md">
          {initialData ? "Edit Configuration" : "New Configuration"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Toyota Vios 2023 - Base"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DROPDOWNS ROW */}
            <div className="flex items-center gap-4 w-full">
              <FormField
                control={form.control}
                name="body_type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Body Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BODY_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Transmission</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSMISSION_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* FUEL & ENGINE */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FUEL_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engine_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 1.3L"
                        {...field}
                        // 👇 FIX: Ensure value is never unknown
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NUMBERS ROW */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="passenger_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seats</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        // 👇 FIX: Ensure value is strictly valid
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="luggage_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bags</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        // 👇 FIX: Ensure value is strictly valid
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buffer_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buffer (Hrs)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        // 👇 FIX: Ensure value is strictly valid
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {form.formState.isSubmitting
                  ? "Saving..."
                  : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
