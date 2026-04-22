"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@/components/ui/form";
import { useDrivers } from "../../../hooks/use-drivers";
import { useUnassignedCarOwners } from "../../../hooks/use-fleetPartners";
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
import { DriverFormValues, driverFormSchema } from "@/lib/schemas/driver";
import { toast } from "sonner";

interface DriverFormProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompleteDriverType | null;
}

function DriverForm({ open, onOpenChange, initialData }: DriverFormProp) {
  const { saveDriver, isSaving } = useDrivers();
  const { data: availableUsers, isLoading: isLoadingUsers } =
    useUnassignedCarOwners();
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      user_id: "",
      driver_status: "Pending",
      is_verified: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          driver_id: initialData.driver_id,
          user_id: initialData.user_id,
          driver_status: initialData.driver_status || "Pending",
          is_verified: initialData.is_verified || false,
        });
      } else {
        form.reset({
          user_id: "",
          driver_status: "Pending",
          is_verified: false,
        });
      }
    }
  }, [initialData, open, form]);

  const onSelectUser = (userId: string) => {
    form.setValue("user_id", userId, { shouldValidate: true });
    setComboboxOpen(false);
  };

  const onSubmit = async (values: DriverFormValues) => {
    const result = await saveDriver(values);

    if (!result.success) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof DriverFormValues, {
            type: "server",
            message: messages[0],
          });
        });
        toast.error("Please fix the errors in the form.");
      } else {
        toast.error(result.message || "Failed to save driver.");
      }
      return; // Stop execution
    }

    toast.success(result.message);
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  // DEBUG TOOL: If save ever does "nothing" again, check your browser console!
  if (Object.keys(form.formState.errors).length > 0) {
    console.log(
      "Silent Form Errors Blocked Submission:",
      form.formState.errors,
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border shadow-2xl rounded-2xl bg-background transition-colors duration-300">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card shrink-0 transition-colors">
          <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase leading-none mb-1">
            {initialData ? "Manage Driver Profile" : "Add New Driver"}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {initialData
              ? "Update operational status and verification"
              : "Select a registered user to promote them"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-5 space-y-4">
              {!initialData ? (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                                "w-full justify-between h-8 text-[11px] font-semibold rounded-lg border-border bg-secondary shadow-none hover:bg-secondary/80 focus:ring-1 focus:ring-primary transition-colors",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? availableUsers?.find(
                                    (u) => u.user_id === field.value,
                                  )?.full_name
                                : "Search users..."}
                              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[410px] p-0 border-border rounded-xl shadow-xl bg-popover">
                          <Command>
                            <CommandInput
                              placeholder="Search name or email..."
                              className="h-9 text-[11px] font-medium border-none focus:ring-0"
                            />
                            <CommandList className="custom-scrollbar">
                              <CommandEmpty className="text-[10px] font-bold uppercase tracking-widest py-4 text-center text-muted-foreground">
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
                                    className="text-[11px] font-semibold cursor-pointer rounded-lg aria-selected:bg-secondary transition-colors px-3 py-2"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5",
                                        user.user_id === field.value
                                          ? "opacity-100 text-primary"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-foreground">
                                        {user.full_name}
                                      </span>
                                      <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
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
                      <FormMessage className="text-[9px] font-bold uppercase tracking-widest" />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="bg-secondary/30 p-3 border border-border rounded-xl transition-colors">
                  <input type="hidden" {...form.register("user_id")} />

                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Driver Identity
                  </p>
                  <p className="text-[11px] font-bold text-foreground uppercase">
                    {initialData.profiles?.full_name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {initialData.profiles?.email}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-1">
                <FormField
                  control={form.control}
                  name="driver_status"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Operational Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 w-full text-[11px] font-semibold rounded-lg border-border bg-secondary shadow-none focus:ring-1 focus:ring-primary transition-colors text-foreground">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border rounded-xl shadow-xl bg-popover">
                          <SelectItem
                            value="Pending"
                            className="text-[11px] font-semibold focus:bg-secondary"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="Available"
                            className="text-[11px] font-semibold focus:bg-secondary"
                          >
                            Available
                          </SelectItem>
                          <SelectItem
                            value="On Trip"
                            className="text-[11px] font-semibold focus:bg-secondary"
                          >
                            On Trip
                          </SelectItem>
                          <SelectItem
                            value="Off Duty"
                            className="text-[11px] font-semibold focus:bg-secondary"
                          >
                            Off Duty
                          </SelectItem>
                          <SelectItem
                            value="Suspended"
                            className="text-[11px] font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            Suspended
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px] font-bold uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-2 bg-secondary/30 h-13 mt-5 transition-colors">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[10px] font-bold text-foreground uppercase tracking-widest m-0 leading-none">
                          Verified
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald-500 scale-90"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("is_verified") && !initialData?.is_verified && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2 transition-colors">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-amber-600/90 dark:text-amber-400/90 font-bold uppercase tracking-widest leading-relaxed">
                    <strong>Manual Override:</strong> Verifying a driver here
                    bypasses the Application Queue. Ensure all documents have
                    been physically verified.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-5 py-3 bg-card border-t border-border flex sm:justify-end gap-2 shrink-0 transition-colors">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg border-border text-foreground hover:bg-secondary shadow-none transition-colors"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-8 px-5 min-w-[140px] text-[10px] font-bold uppercase tracking-widest rounded-lg bg-primary hover:opacity-90 text-primary-foreground shadow-sm transition-opacity"
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
