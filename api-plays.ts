import { supabase } from "@/lib/supabase";
import { askClaude } from "@/lib/anthropic";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("play_details").select("*");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const {
    fileName,
    title,
    category,
    action,
    companyName,
    companySector,
    companyStage,
  } = await req.json();

  if (action === "summarize") {
    // Check cache
    const { data: cached } = await supabase
      .from("play_details")
      .select("*")
      .eq("file_name", fileName)
      .single();
    if (cached?.summary) return NextResponse.json(cached);

    const text = await askClaude(
      `You are reading a Riverwood Capital RSP play called "${title}". Provide: 1) Overview (2-3 paragraphs), 2) Key frameworks or models, 3) Implementation steps. Be specific and actionable.`,
      [
        {
          role: "user",
          content: `Summarize the RSP play: ${title} (${fileName}). This is a growth equity operating playbook used by Riverwood Capital's portfolio operations team.`,
        },
      ]
    );

    const { data } = await supabase
      .from("play_details")
      .upsert({
        file_name: fileName,
        title,
        category,
        summary: text,
        cached_at: new Date().toISOString(),
      })
      .select()
      .single();
    return NextResponse.json(data);
  }

  if (action === "apply") {
    const { data: play } = await supabase
      .from("play_details")
      .select("summary")
      .eq("file_name", fileName)
      .single();

    const text = await askClaude(
      `Create initiative steps for applying the Riverwood RSP play "${title}" to "${companyName}" (${companySector}, ${companyStage}). Return ONLY a JSON array: [{"title":"step title","owner":"suggested owner"}]. Generate 4-6 specific, actionable steps. No markdown, no backticks, just the JSON array.`,
      [
        {
          role: "user",
          content: `Generate initiatives. Play summary: ${play?.summary?.slice(0, 800) || title}`,
        },
      ]
    );

    let steps: { title: string; owner: string }[] = [];
    try {
      const match = text.replace(/```json|```/g, "").match(/\[[\s\S]*?\]/);
      if (match) steps = JSON.parse(match[0]);
    } catch {
      // fallback
    }
    return NextResponse.json({ steps });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
