"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useDrivers } from "../../../hooks/use-drivers";
import { useUnassignedCarOwners } from "../../../hooks/use-fleetPartners"; // Keep if you use this to find available users
import { Check, ChevronsUpDown, Loader2, ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CompleteDriverType } from "@/lib/schemas/driver";

interface DriverFormProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompleteDriverType | null;
}

// STRICTLY OPERATIONAL SCHEMA
const formSchema = z.object({
  driver_id: z.string().optional(),
  user_id: z.string().min(1, "You must select a user account"),
  driver_status: z.string().min(5, "Status is required"),
  is_verified: z.boolean().default(false),
});

type DriverFormValues = z.infer<typeof formSchema>;

function DriverForm({ open, onOpenChange, initialData }: DriverFormProp) {
  const { saveDriver, isSaving } = useDrivers();
  const { data: availableUsers, isLoading: isLoadingUsers } =
    useUnassignedCarOwners();
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      driver_status: "Pending",
      is_verified: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // EDIT MODE
        form.reset({
          driver_id: initialData.driver_id,
          user_id: initialData.user_id,
          driver_status: (initialData.driver_status as any) || "Pending",
          is_verified: initialData.is_verified || false,
        });
      } else {
        // CREATE MODE
        form.reset({
          user_id: "",
          driver_status: "Pending",
          is_verified: false,
        });
      }
    }
  }, [initialData, open, form]);

  const onSelectUser = (userId: string) => {
    form.setValue("user_id", userId);
    setComboboxOpen(false);
  };

  const onSubmit = async (values: DriverFormValues) => {
    const payload: any = {
      driver_id: values.driver_id,
      user_id: values.user_id,
      driver_status: values.driver_status,
      is_verified: values.is_verified,
    };

    saveDriver(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-slate-200 shadow-xl rounded-sm bg-white">
        <DialogHeader className="px-5 py-4 border-b border-slate-200 bg-[#F8FAFC]">
          <DialogTitle className="text-sm font-bold text-[#0F172A] tracking-tight">
            {initialData ? "Manage Driver Profile" : "Add New Driver"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {initialData
              ? "Update operational status and verification."
              : "Select a registered user to promote them to the driver fleet."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-5 space-y-5">
              {/* Only show User Selector if creating a NEW driver */}
              {!initialData ? (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Link Customer Account
                      </FormLabel>
                      <Popover
                        open={comboboxOpen}
                        onOpenChange={setComboboxOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-9 text-xs rounded-sm border-slate-200 shadow-none",
                                !field.value && "text-slate-400",
                              )}
                            >
                              {field.value
                                ? availableUsers?.find(
                                    (u) => u.user_id === field.value,
                                  )?.full_name
                                : "Search users..."}
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[410px] p-0 border-slate-200 rounded-sm shadow-md">
                          <Command>
                            <CommandInput
                              placeholder="Search name or email..."
                              className="h-9 text-xs"
                            />
                            <CommandList>
                              <CommandEmpty className="text-xs py-3 text-center text-slate-500">
                                {isLoadingUsers
                                  ? "Loading..."
                                  : "No eligible users found."}
                              </CommandEmpty>
                              <CommandGroup>
                                {availableUsers?.map((user) => (
                                  <CommandItem
                                    key={user.user_id}
                                    value={user.full_name}
                                    onSelect={() => onSelectUser(user.user_id)}
                                    className="text-xs cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5",
                                        user.user_id === field.value
                                          ? "opacity-100 text-[#0F172A]"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium text-[#0F172A]">
                                        {user.full_name}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {user.email}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              ) : (
                // If editing, just display who this is without letting them change the user linkage
                <div className="bg-slate-50 p-3 border border-slate-100 rounded-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Driver Identity
                  </p>
                  <p className="text-xs font-bold text-[#0F172A]">
                    {initialData.profiles?.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {initialData.profiles?.email}
                  </p>
                </div>
              )}

              {/* Operational Controls */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driver_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Operational Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs rounded-sm border-slate-200 shadow-none">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-200 rounded-sm">
                          <SelectItem value="Pending" className="text-xs">
                            Pending
                          </SelectItem>
                          <SelectItem value="Available" className="text-xs">
                            Available
                          </SelectItem>
                          <SelectItem value="On Trip" className="text-xs">
                            On Trip
                          </SelectItem>
                          <SelectItem value="Off Duty" className="text-xs">
                            Off Duty
                          </SelectItem>
                          <SelectItem
                            value="Suspended"
                            className="text-xs text-red-600 focus:text-red-700"
                          >
                            Suspended
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-sm border border-slate-200 p-3 shadow-none bg-white h-9 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs font-bold text-slate-700 m-0">
                          Verified
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Warning for manual verification */}
              {form.watch("is_verified") && !initialData?.is_verified && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-sm mt-4">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                    <strong>Manual Override:</strong> Verifying a driver here
                    bypasses the Application Queue. Ensure all documents have
                    been physically verified.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-5 py-3 bg-[#F8FAFC] border-t border-slate-200 flex sm:justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs font-bold rounded-sm border-slate-200 text-slate-600 hover:bg-slate-100 shadow-none"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-8 text-xs font-bold rounded-sm bg-[#0F172A] hover:bg-slate-800 text-white shadow-none"
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {initialData ? "Save Status" : "Promote to Driver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default DriverForm;
