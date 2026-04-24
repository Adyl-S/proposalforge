import { NextResponse } from 'next/server';
import { generateProposalData } from '@/lib/ai/generate-proposal';
import { aiProviderName } from '@/lib/ai/ai-client';
import { assembleProposalHtml } from '@/lib/pdf/template';
import { generateProposalPdf } from '@/lib/pdf/generate-pdf';
import { getKnowledgeBase } from '@/lib/knowledge-base/manager';
import { newProposalId, proposalDir, saveProposal } from '@/lib/proposals/store';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ProposalInput } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 120; // seconds

export async function POST(req: Request) {
  let input: ProposalInput;
  try {
    input = (await req.json()) as ProposalInput;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!input?.projectTitle || !input?.clientName) {
    return NextResponse.json(
      { error: 'projectTitle and clientName are required' },
      { status: 400 },
    );
  }

  const hasEnriched = Boolean(input.enrichedCompanyId?.trim());
  const hasTextPrompt = Boolean(input.projectPrompt?.trim());

  // Step 14: legacy/small REQUIRE enrichedCompanyId (scraper-first path).
  // linkedin/upwork still use the textarea path via projectPrompt.
  if ((input.useCase === 'legacy' || input.useCase === 'small') && !hasEnriched) {
    return NextResponse.json(
      {
        error:
          'legacy and small proposals require enrichedCompanyId — run the scraper and approve the analysis first',
      },
      { status: 400 },
    );
  }

  if (!hasEnriched && !hasTextPrompt) {
    return NextResponse.json(
      { error: 'Either enrichedCompanyId or projectPrompt is required' },
      { status: 400 },
    );
  }

  const id = newProposalId();
  const dir = proposalDir(id);
  mkdirSync(dir, { recursive: true });

  try {
    const kb = getKnowledgeBase();
    const data = await generateProposalData(input, kb);
    const html = assembleProposalHtml(data);

    const outPath = join(dir, 'proposal.pdf');
    const pdf = await generateProposalPdf({ html, outputPath: outPath });

    await saveProposal(id, pdf, {
      id,
      projectTitle: input.projectTitle,
      clientName: input.clientName,
      clientIndustry: input.clientIndustry,
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: input.proposalVersion ?? '1.0',
      aiProvider: aiProviderName(),
      sizeBytes: pdf.length,
      input,
      enrichedCompanyId: input.enrichedCompanyId ?? null,
      draftStatus: 'generated',
      sections: data as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      ok: true,
      id,
      sizeBytes: pdf.length,
      provider: aiProviderName(),
      pdfUrl: `/api/proposals/${id}/pdf`,
      previewUrl: `/proposals/${id}`,
    });
  } catch (err) {
    console.error('[api/generate] error:', err);
    const msg = err instanceof Error ? err.message : 'generation failed';
    // Approval-gate failure surfaces as 400 so the UI can show a clear message
    // without looking like a server crash.
    const isApprovalGate = msg.startsWith('Analysis pending review');
    return NextResponse.json(
      { error: msg },
      { status: isApprovalGate ? 400 : 500 },
    );
  }
}
