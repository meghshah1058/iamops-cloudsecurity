import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all GCP projects for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const projects = await prisma.gcpProject.findMany({
      where: { userId: user.id },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            riskScore: true,
            totalFindings: true,
            critical: true,
            high: true,
            medium: true,
            low: true,
            completedAt: true,
          },
        },
        _count: {
          select: { audits: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GCP Projects API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new GCP project
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, projectId, projectNumber, region, serviceAccountKey } = body;

    if (!name || !projectId) {
      return NextResponse.json(
        { error: "Name and Project ID are required" },
        { status: 400 }
      );
    }

    // Check if project already exists for this user
    const existingProject = await prisma.gcpProject.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project already exists" },
        { status: 409 }
      );
    }

    const project = await prisma.gcpProject.create({
      data: {
        name,
        projectId,
        projectNumber: projectNumber || null,
        region: region || "us-central1",
        serviceAccountKey: serviceAccountKey || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("GCP Projects API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
