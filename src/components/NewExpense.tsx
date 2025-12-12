"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ChevronDownIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { addExpense } from "@/actions/actions";
import { newExpenseSchema } from "@/lib/schemas";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { expenseCategories } from "@/lib/utils";

export default function NewExpense() {
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof newExpenseSchema>>({
    resolver: zodResolver(newExpenseSchema),
    defaultValues: {
      userId: "",
      amount: 0,
      date: new Date(),
      description: "",
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof newExpenseSchema>) {
    try {
      const res = await addExpense(values);

      if (res?.error) throw new Error(res.error);

      toast.success("Expense added successfully!");
      form.reset();
      setShowModal(false);

      // Trigger a page refresh or refetch to update all components
      window.dispatchEvent(new Event("expenseAdded"));
    } catch (err) {
      toast.error("Failed to add expense!");
      console.error(err);
    }
  }

  const handleCancel = () => {
    form.reset();
    setShowModal(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-50 group"
        aria-label="Add new expense"
      >
        <Plus className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Add Expense
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="roboto-slab">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="add-expense"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mx-auto"
              >
                <FieldGroup>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation="responsive"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent>
                          <FieldLabel htmlFor="add-expense-category">
                            Category
                          </FieldLabel>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="add-expense-category"
                            aria-invalid={fieldState.invalid}
                            className="min-w-[120px]"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent position="item-aligned">
                            {expenseCategories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    name="amount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="add-expense-amount">
                          Amount
                        </FieldLabel>
                        <Input
                          {...field}
                          id="add-expense-amount"
                          aria-invalid={fieldState.invalid}
                          placeholder="100.00"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="add-expense-date">Date</FieldLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="add-expense-date"
                              className="w-48 justify-between font-normal"
                            >
                              {field.value
                                ? field.value.toLocaleDateString()
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              captionLayout="dropdown"
                              onSelect={(value) => {
                                field.onChange(value);
                                setOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="add-expense-description">
                          Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="add-expense-description"
                          aria-invalid={fieldState.invalid}
                          placeholder="Some description about the expense"
                          className="min-h-[120px]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter>
              <Field orientation="horizontal">
                <Button
                  type="button"
                  variant="outline"
                  className="w-[50%]"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-[50%]" form="add-expense">
                  Add Expense
                </Button>
              </Field>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
