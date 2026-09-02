export interface JobMetadata {
  companyName?: string;
  companyWebsite?: string;
  startDate?: string;
  endDate?: string;
  skills: string[];
  salaryRange?: string;
  experienceLevel?: string;
  workplaceType?: string;
  cleanDescription: string;
}

export function parseJobDescription(raw?: string | null): JobMetadata {
  if (!raw) {
    return {
      skills: [],
      cleanDescription: '',
    };
  }

  const metadataMatch = raw.match(/\[METADATA\]([\s\S]*?)\[END_METADATA\]/);
  if (!metadataMatch) {
    return {
      skills: [],
      cleanDescription: raw.trim(),
    };
  }

  const metaBlock = metadataMatch[1];
  const cleanDescription = raw.replace(/\[METADATA\][\s\S]*?\[END_METADATA\]\n*/, '').trim();

  const lines = metaBlock.split('\n');
  const metadata: JobMetadata = {
    skills: [],
    cleanDescription,
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Company:')) {
      metadata.companyName = trimmed.replace('Company:', '').trim();
    } else if (trimmed.startsWith('CompanyWebsite:')) {
      metadata.companyWebsite = trimmed.replace('CompanyWebsite:', '').trim();
    } else if (trimmed.startsWith('StartDate:')) {
      metadata.startDate = trimmed.replace('StartDate:', '').trim();
    } else if (trimmed.startsWith('EndDate:')) {
      metadata.endDate = trimmed.replace('EndDate:', '').trim();
    } else if (trimmed.startsWith('Salary:')) {
      metadata.salaryRange = trimmed.replace('Salary:', '').trim();
    } else if (trimmed.startsWith('Experience:')) {
      metadata.experienceLevel = trimmed.replace('Experience:', '').trim();
    } else if (trimmed.startsWith('Workplace:')) {
      metadata.workplaceType = trimmed.replace('Workplace:', '').trim();
    } else if (trimmed.startsWith('Skills:')) {
      const skillsStr = trimmed.replace('Skills:', '').trim();
      if (skillsStr) {
        metadata.skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  return metadata;
}

export function serializeJobDescription(
  metadata: {
    companyName?: string;
    companyWebsite?: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
    salaryRange?: string;
    experienceLevel?: string;
    workplaceType?: string;
  },
  description: string
): string {
  const parts: string[] = [];

  if (metadata.companyName?.trim()) parts.push(`Company: ${metadata.companyName.trim()}`);
  if (metadata.companyWebsite?.trim()) parts.push(`CompanyWebsite: ${metadata.companyWebsite.trim()}`);
  if (metadata.startDate?.trim()) parts.push(`StartDate: ${metadata.startDate.trim()}`);
  if (metadata.endDate?.trim()) parts.push(`EndDate: ${metadata.endDate.trim()}`);
  if (metadata.skills && metadata.skills.length > 0) {
    parts.push(`Skills: ${metadata.skills.map((s) => s.trim()).filter(Boolean).join(', ')}`);
  }
  if (metadata.salaryRange?.trim()) parts.push(`Salary: ${metadata.salaryRange.trim()}`);
  if (metadata.experienceLevel?.trim()) parts.push(`Experience: ${metadata.experienceLevel.trim()}`);
  if (metadata.workplaceType?.trim()) parts.push(`Workplace: ${metadata.workplaceType.trim()}`);

  if (parts.length === 0) {
    return description.trim();
  }

  return `[METADATA]\n${parts.join('\n')}\n[END_METADATA]\n\n${description.trim()}`;
}
