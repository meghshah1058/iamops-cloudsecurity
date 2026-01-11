import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const SYSTEM_PROMPT = `You are an expert AWS security assistant integrated into an AWS Security Audit Dashboard. Your role is to help users understand their security findings, provide remediation guidance, and answer questions about AWS security best practices.

You have knowledge of:
- All 25 audit phases covering IAM, S3, Network, Compute, Data Services, Logging, Compliance, and more
- AWS security best practices and CIS benchmarks
- Common security misconfigurations and their remediation steps
- Severity classifications: Critical, High, Medium, Low

When responding:
1. Be concise but thorough
2. Provide specific, actionable remediation steps when asked
3. Reference AWS documentation when appropriate
4. Prioritize critical and high severity issues
5. Consider the user's context and findings

You should help users:
- Understand what their findings mean
- Prioritize which issues to fix first
- Learn how to implement fixes
- Understand compliance implications
- Identify patterns in their security posture`;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build context from audit data if provided
    let contextPrompt = "";
    if (context) {
      contextPrompt = `\n\nCurrent Audit Context:
- Account: ${context.accountName || "Unknown"}
- Total Findings: ${context.totalFindings || 0}
- Critical: ${context.critical || 0}
- High: ${context.high || 0}
- Medium: ${context.medium || 0}
- Low: ${context.low || 0}
- Security Score: ${context.score || "N/A"}%`;
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a mock response for demo purposes
      return NextResponse.json({
        role: "assistant",
        content: "I'm the AI Security Assistant. To enable full functionality, please configure your ANTHROPIC_API_KEY in the environment variables. For now, I can provide basic guidance:\n\n1. **Critical findings** should be addressed immediately\n2. **High severity** issues need attention within 24-48 hours\n3. **Medium and Low** can be scheduled for regular maintenance\n\nWould you like me to explain any specific security concepts?",
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      role: "assistant",
      content: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
