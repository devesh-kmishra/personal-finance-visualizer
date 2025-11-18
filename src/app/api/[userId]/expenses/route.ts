import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}
