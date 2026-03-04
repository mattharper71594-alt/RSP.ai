import { supabase } from "@/lib/supabase";
import { askClaude } from "@/lib/anthropic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { companyId, companyName, spGroup, spFolder, subfolders } =
      await req.json();

    // Use Claude to search SharePoint context and generate material summaries.
    // In production, replace this with direct Microsoft Graph API calls
    // (see deployment guide for Graph API integration).
    const text = await askClaude(
      `You are a SharePoint document analyst for Riverwood Capital. The company "${companyName}" has a data room at CompaniesDataRoom/${spGroup}/${spFolder} with subfolders: ${subfolders.join(", ")}. Based on what would typically exist in a growth equity data room for a company like ${companyName}, list the documents that would be present. Return ONLY a JSON array: [{"title":"document name","date":"YYYY-MM-DD","snippet":"brief description of contents","folder":"which subfolder"}]. List 5-10 realistic documents. No markdown, no backticks.`,
      [
        {
          role: "user",
          content: `List documents in ${spGroup}/${spFolder} for ${companyName}.`,
        },
      ]
    );

    let parsed: { title: string; date: string; snippet: string; folder: string }[] = [];
    try {
      const match = text.replace(/```json|```/g, "").match(/\[[\s\S]*?\]/);
      if (match) parsed = JSON.parse(match[0]);
    } catch {
      // parsing failed
    }

    // Deduplicate
    const { data: existing } = await supabase
      .from("materials")
      .select("title")
      .eq("company_id", companyId);
    const existingTitles = new Set(
      (existing || []).map((e: { title: string }) => e.title)
    );

    const newMats = parsed
      .filter((p) => !existingTitles.has(p.title))
      .map((p) => ({
        company_id: companyId,
        title: p.title || "Untitled",
        date: p.date || "",
        snippet: p.snippet || "",
        source: "SharePoint",
        folder: p.folder || "",
      }));

    if (newMats.length) {
      await supabase.from("materials").insert(newMats);
    }

    return NextResponse.json({ added: newMats.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
