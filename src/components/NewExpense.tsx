"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ChevronDownIcon } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const form = useForm<z.infer<typeof newExpenseSchema>>({
    resolver: zodResolver(newExpenseSchema),
    defaultValues: {
      userId: "",
      amount: 0,
      date: date,
      description: "",
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof newExpenseSchema>) {
    try {
      await addExpense(values);
      toast.success(
        <p className="font-semibold text-lg text-shadow-green-600">
          New expense added
        </p>
      );
      form.reset();
    } catch (err) {
      toast.error("Failed to add expense");
      console.error(err);
    }
  }

  return (
    <Card className="w-full lg:w-md mx-auto lg:mx-4">
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
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
                  <FieldLabel htmlFor="add-expense-amount">Amount</FieldLabel>
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
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        {...field}
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
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
          <Button type="submit" className="w-full" form="add-expense">
            Add Expense
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
