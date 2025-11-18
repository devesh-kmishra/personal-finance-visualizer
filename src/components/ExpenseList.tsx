"use client";

import { editingExpSchema } from "@/lib/schemas";
import {
  expenseCategories,
  formatExpenseCategory,
  formatExpenseDate,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { editExpense } from "@/actions/actions";
import { useOptimisticDelete } from "@/hooks/use-optimistic-delete";

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export default function ExpenseList({ userId }: { userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof editingExpSchema>>({
    resolver: zodResolver(editingExpSchema),
    defaultValues: {
      id: editingExp ? editingExp.id : "",
      amount: 0,
      date: new Date(),
      description: "",
      category: "ot",
    },
  });
  const { handleDelete } = useOptimisticDelete(expenses, setExpenses);

  useEffect(() => {
    (async function fetchExpenses() {
      const res = await fetch(`/api/${userId}/expenses`);
      const data = await res.json();
      setExpenses(data);
    })();
  }, [editingExp, userId]);

  const handleEdit = (id: string) => {
    const exp = expenses.find((e) => e.id === id);

    if (!exp) return;

    setEditingExp(exp);
    form.reset({
      id: exp.id,
      date: new Date(exp.date),
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
    });
  };

  const cancelEdit = () => {
    setEditingExp(null);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof editingExpSchema>) => {
    if (!editingExp) return;

    try {
      await editExpense(values);
      setEditingExp(null);
      form.reset();
    } catch (err) {
      toast.error("Failed to edit expense");
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {/* Expense list */}
      <ScrollArea className="w-full h-[80vh] rounded-md border p-4">
        {expenses.length > 0 ? (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="border-b pb-3 mb-3 flex flex-col gap-1 last:border-b-0 last:mb-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {formatExpenseDate(exp.date)}
                  </p>
                  <p className="font-medium max-w-[25vw] overflow-auto overflow-ellipsis">
                    {exp.description}
                  </p>
                  <p className="text-xs roboto-slab italic text-gray-500">
                    {formatExpenseCategory(exp.category)}
                  </p>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  ₹{exp.amount}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(exp.id)}
                  size="sm"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500 transition"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(exp.id)}
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500 transition"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <h2 className="text-gray-500">No expenses found.</h2>
        )}
      </ScrollArea>

      {/* Edit modal */}
      {editingExp && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50">
          <Card className="p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <CardHeader>
              <CardTitle className="roboto-slab">Edit Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="edit-expense"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-3"
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
                          <FieldLabel htmlFor="edit-expense-category">
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
                            id="edit-expense-category"
                            aria-invalid={fieldState.invalid}
                            className="min-w-[120px]"
                          >
                            <SelectValue placeholder="Select" />
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
                        <FieldLabel htmlFor="edit-expense-amount">
                          Amount
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-expense-amount"
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
                        <FieldLabel htmlFor="edit-expense-date">
                          Date
                        </FieldLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="edit-expense-date"
                              className="w-48 justify-between font-normal"
                            >
                              {field.value
                                ? field.value.toLocaleDateString()
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(value) => {
                                field.onChange(value);
                                setOpen(false);
                              }}
                              captionLayout="dropdown"
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
                        <FieldLabel htmlFor="edit-expense-description">
                          Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="edit-expense-description"
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
            <CardFooter className="flex justify-center gap-3 mt-5">
              <Field orientation="horizontal">
                <Button
                  type="button"
                  className="w-[50%]"
                  onClick={() => cancelEdit()}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-[50%]" form="edit-expense">
                  Save
                </Button>
              </Field>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
