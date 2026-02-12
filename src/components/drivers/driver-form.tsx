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
import { Input } from "@/components/ui/input";
import { useDrivers } from "../../../hooks/use-drivers";
import { useUnassignedCarOwners } from "../../../hooks/use-fleetPartners";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CompleteDriverType, completeDriverSchema } from "@/lib/schemas/driver";

interface DriverFormProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompleteDriverType | null;
}

const formSchema = z.object({
  driver_id: z.string().optional(),
  user_id: z.string().min(1, "You must link a user account"),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email(),
  phone_number: z.string().min(10, "Phone number is required"),
  license_number: z.string().min(5, "License number is required"),
  license_expiry_date: z.string().min(1, "Expiry date is required"),
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
      first_name: "",
      last_name: "",
      phone_number: "",
      license_number: "",
      license_expiry_date: "",
      driver_status: "Pending",
      is_verified: false,
    },
  });

  console.log("Driver form data: ", form.watch());

  useEffect(() => {
    if (open) {
      if (initialData) {
        // EDIT MODE: Split the full_name into first and last
        const p = initialData.profiles;
        const fullName = p?.full_name || "";
        const parts = fullName.split(" ");
        const fname = p?.first_name || parts[0] || "";
        const lname = p?.last_name || parts.slice(1).join(" ") || "";

        form.reset({
          driver_id: initialData.driver_id,
          user_id: initialData.user_id,
          first_name: fname,
          last_name: lname,
          email: p?.email || "",
          phone_number: p?.phone_number || "",
          license_number: p?.license_number || "",
          license_expiry_date: p?.license_expiry_date
            ? new Date(p.license_expiry_date).toISOString().split("T")[0]
            : "",
          driver_status: (initialData.driver_status as any) || "Pending",
          is_verified: initialData.is_verified || false,
        });
      } else {
        // CREATE MODE
        form.reset({
          user_id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          license_number: "",
          license_expiry_date: "",
          driver_status: "Pending",
          is_verified: false,
        });
      }
    }
  }, [initialData, open, form]);

  const onSelectUser = (userId: string) => {
    const selectedUser = availableUsers?.find((u) => u.user_id === userId);
    if (!selectedUser) return;

    const fullName = selectedUser.full_name || "";
    const parts = fullName.split(" ");

    form.setValue("user_id", selectedUser.user_id);
    form.setValue("first_name", parts[0] || "");
    form.setValue("last_name", parts.slice(1).join(" ") || "");
    form.setValue("email", selectedUser.email || "");
    form.setValue("phone_number", selectedUser.phone_number || "");

    setComboboxOpen(false);
  };

  const onSubmit = async (values: DriverFormValues) => {
    const payload: any = {
      driver_id: values.driver_id,
      user_id: values.user_id,
      driver_status: values.driver_status,
      is_verified: values.is_verified,
      profiles: {
        full_name: `${values.first_name} ${values.last_name}`.trim(),
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        license_number: values.license_number,
        license_expiry_date: values.license_expiry_date,
      },
    };

    saveDriver(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Driver" : "Add New Driver"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modify the driver's current information and status."
              : "Select an unassigned customer to create their driver profile."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-3">
              {/* Left Column: Profile & Account */}
              <div className="flex flex-col gap-4">
                {!initialData && (
                  <div className="rounded-lg border p-4 bg-muted/30 h-fit">
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Select Customer Account</FormLabel>
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
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground",
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {field.value
                                    ? availableUsers?.find(
                                        (u) => u.user_id === field.value,
                                      )?.full_name
                                    : "Search customers..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                              <Command>
                                <CommandInput placeholder="Search name or email..." />
                                <CommandList>
                                  <CommandEmpty>
                                    {isLoadingUsers
                                      ? "Loading..."
                                      : "No users found"}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {availableUsers?.map((user) => (
                                      <CommandItem
                                        key={user.user_id}
                                        value={user.full_name}
                                        onSelect={() =>
                                          onSelectUser(user.user_id)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            user.user_id === field.value
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span>{user.full_name}</span>
                                          <span className="text-xs text-muted-foreground">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Name & Email Card: h-full ensures this stretches to match the right side */}
                <div className="rounded-lg border p-4 bg-muted/30 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Account ID)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </FormControl>
                        <FormDescription>
                          Emails cannot be changed here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column: License & Status */}
              <div className="rounded-lg border p-4 bg-muted/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="N01-XX-XXXXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="license_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="is_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                        <FormLabel className="m-0">Verify Driver</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[50%]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="On Trip">On Trip</SelectItem>
                            <SelectItem value="Off Duty">Off Duty</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <div className="gap-2 flex flex-row-reverse items-center w-full">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {initialData ? "Save Changes" : "Create Driver"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default DriverForm;
